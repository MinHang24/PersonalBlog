"""Check the executable artifact, not merely the selected Maven profile."""
from pathlib import Path
import sys
from zipfile import ZipFile

profile = sys.argv[1]
if profile not in {"dev", "prod"}:
    raise SystemExit("Expected dev or prod")
jars = list(Path("target").glob("backend-*.jar"))
if len(jars) != 1:
    raise SystemExit("Expected exactly one backend JAR; run Maven clean package first")
with ZipFile(jars[0]) as jar:
    prefix = "BOOT-INF/classes/"
    names = set(jar.namelist())
    common = jar.read(prefix + "application.properties").decode("utf-8")
    assert f"spring.profiles.default={profile}" in common, "Incorrect default profile"
    assert "@runtime.profile@" not in common, "Maven resource filtering did not run"
    actual = {n for n in names if n.startswith(prefix + "application-") and n.endswith(".properties")}
    assert actual == {prefix + f"application-{profile}.properties"}, actual
    environment = jar.read(prefix + f"application-{profile}.properties").decode("utf-8")
    if profile == "prod":
        for value in ("spring.jpa.hibernate.ddl-auto=validate", "blog.seed.enabled=false",
                      "server.servlet.session.cookie.secure=true", "${DATABASE_PASSWORD}"):
            assert value in environment, f"Missing production setting: {value}"
print(f"Verified {jars[0]}: {profile} only; runtime environment placeholders preserved")
