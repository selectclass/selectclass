sed -i 's/interface CotacoesScreenProps {/interface CotacoesScreenProps {\n  targetCotacaoId?: string | null;\n  onClearTargetCotacao?: () => void;/g' components/CotacoesScreen.tsx
sed -i 's/lectureModels/lectureModels,\n  targetCotacaoId,\n  onClearTargetCotacao/g' components/CotacoesScreen.tsx
