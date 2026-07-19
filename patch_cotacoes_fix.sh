sed -i 's/  lectureModels,\n  targetCotacaoId,\n  onClearTargetCotacao?: any\[\];/  lectureModels?: any\[\];/g' components/CotacoesScreen.tsx
sed -i 's/lectureModels,\n  targetCotacaoId,\n  onClearTargetCotacao = \[\]/lectureModels = \[\]/g' components/CotacoesScreen.tsx
