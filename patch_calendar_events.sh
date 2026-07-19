sed -i 's/const getDayEventsList = (dayDate: Date): string\[\] => {/const getDayEventsList = (dayDate: Date): { id: string, name: string, isCotacao?: boolean }[] => {/g' components/Calendar.tsx
