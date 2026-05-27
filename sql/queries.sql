-- Consulta para traer cada nota junto con sus elementos de checklist y sus etiquetas.
-- Usamos LEFT JOIN para que todas las notas aparezcan, incluso si no tienen elementos o etiquetas.
SELECT
  n.*,
  json_agg(ci.*) FILTER (WHERE ci.id IS NOT NULL) AS items,
  json_agg(nt.tag) FILTER (WHERE nt.id IS NOT NULL) AS tags
FROM notes n
LEFT JOIN checklist_items ci ON n.id = ci.note_id
LEFT JOIN note_tags nt ON n.id = nt.note_id
GROUP BY n.id
ORDER BY n.created_at DESC;
