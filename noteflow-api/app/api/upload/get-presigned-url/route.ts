import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { verifyFirebaseIdToken } from '../../../../lib/auth';

// Este endpoint genera una presigned URL para subir a S3
// Se debe llamar desde la app móvil ANTES de subir la imagen

const requestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  folder: z.enum(['profiles', 'notes', 'attachments']).default('profiles'),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    let userId: string;

    try {
      const decoded = await verifyFirebaseIdToken(token);
      userId = decoded.uid;
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // 2. Validar body
    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 });
    }

    const { filename, contentType, folder } = result.data;

    // 3. Generar presigned URL
    // En producción, usar AWS SDK v3:
    // import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
    // import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
    
    const s3Bucket = process.env.AWS_S3_BUCKET;
    const s3Region = process.env.AWS_S3_REGION || 'us-east-1';
    const s3AccessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
    const s3SecretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY;

    if (!s3Bucket || !s3AccessKeyId || !s3SecretAccessKey) {
      console.error('Falta configurar variables de S3');
      return NextResponse.json(
        { error: 'Error en configuración de S3' },
        { status: 500 }
      );
    }

    // 4. Crear path único
    // Formato: {folder}/{userId}/{timestamp}-{filename}
    const timestamp = Date.now();
    const s3Key = `${folder}/${userId}/${timestamp}-${filename}`;

    const s3Client = new S3Client({
      region: s3Region,
      credentials: {
        accessKeyId: s3AccessKeyId,
        secretAccessKey: s3SecretAccessKey,
      },
    });

    const command = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: s3Key,
      ContentType: contentType,
      ACL: 'public-read',
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    const publicUrl = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${s3Key}`;

    return NextResponse.json({
      signedUrl: presignedUrl,
      publicUrl,
      s3Key,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Error al generar presigned URL:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
