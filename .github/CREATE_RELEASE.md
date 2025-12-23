# Como Criar uma Release no GitHub

## Método 1: Usando GitHub CLI (Recomendado)

Se você tem o GitHub CLI instalado:

```bash
./scripts/create-release.sh v1.0.0
```

Ou manualmente:

```bash
gh release create v1.0.0 \
  --title "Release v1.0.0 - ComplianceEngine API" \
  --notes-file .github/RELEASE_NOTES_v1.0.0.md \
  --repo resper1965/nprocess
```

## Método 2: Via GitHub Web UI

1. Acesse: https://github.com/resper1965/nprocess/releases/new

2. Selecione a tag: `v1.0.0`

3. Título: `Release v1.0.0 - ComplianceEngine API`

4. Descrição: Copie o conteúdo de `.github/RELEASE_NOTES_v1.0.0.md`

5. Marque como "Latest release" (se for a mais recente)

6. Clique em "Publish release"

## Método 3: Via API REST

```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/resper1965/nprocess/releases \
  -d '{
    "tag_name": "v1.0.0",
    "name": "Release v1.0.0 - ComplianceEngine API",
    "body": "Conteúdo de .github/RELEASE_NOTES_v1.0.0.md",
    "draft": false,
    "prerelease": false
  }'
```

## Verificar Release Criada

Após criar, verifique em:
https://github.com/resper1965/nprocess/releases

## Próximas Releases

Para criar novas releases:

1. Atualize o `CHANGELOG.md`
2. Crie release notes em `.github/RELEASE_NOTES_vX.X.X.md`
3. Crie a tag: `git tag -a vX.X.X -m "Release vX.X.X"`
4. Push da tag: `git push origin vX.X.X`
5. Crie a release usando um dos métodos acima

