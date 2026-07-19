sed -i 's/if (!eventNames.includes(e.title)) {/if (!eventNames.some(ev => ev.name === e.title)) {/g' components/Calendar.tsx
sed -i 's/eventNames.push(e.title);/eventNames.push({ id: e.id, name: e.title });/g' components/Calendar.tsx
sed -i 's/if (!eventNames.includes(name)) { eventNames.push(name); }/if (!eventNames.some(ev => ev.name === name)) { eventNames.push({ id: c.id, name, isCotacao: true }); }/g' components/Calendar.tsx
