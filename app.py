import psycopg2

conn = psycopg2.connect(
    host="shared-postgresql-new",
    port=5432,
    dbname="basketball-demo",
    user="spinova_dev",
    password="SpDev2026Secure!"
)
cursor = conn.cursor()
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
print(cursor.fetchall())