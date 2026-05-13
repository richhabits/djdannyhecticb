-- Verify RLS policies are applied
SELECT table_name, COUNT(*) as policy_count
FROM information_schema.tables t
LEFT JOIN pg_policies p ON p.tablename = t.table_name
WHERE table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;

-- Should show ~5 policies per table if RLS is applied correctly
