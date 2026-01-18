
import React, { useState, useEffect } from 'react';
import { CalendarEvent, CourseType, PaymentRecord, MaterialItem } from '../types';
import { AlertCircleIcon, CheckCircleIcon, XIcon, TrashIcon, DollarSignIcon, WhatsAppIcon, CheckIcon, BoxIcon, PlusIcon, MapPinIcon } from './Icons';

const BRAZIL_CITIES = [
  { city: 'São Paulo', state: 'SP' }, { city: 'Rio de Janeiro', state: 'RJ' }, { city: 'Belo Horizonte', state: 'MG' },
  { city: 'Brasília', state: 'DF' }, { city: 'Salvador', state: 'BA' }, { city: 'Fortaleza', state: 'CE' },
  { city: 'Curitiba', state: 'PR' }, { city: 'Manaus', state: 'AM' }, { city: 'Recife', state: 'PE' },
  { city: 'Porto Alegre', state: 'RS' }, { city: 'Goiânia', state: 'GO' }, { city: 'Belém', state: 'PA' },
  { city: 'Guarulhos', state: 'SP' }, { city: 'Campinas', state: 'SP' }, { city: 'São Luís', state: 'MA' },
  { city: 'São Gonçalo', state: 'RJ' }, { city: 'Maceió', state: 'AL' }, { city: 'Duque de Caxias', state: 'RJ' },
  { city: 'Natal', state: 'RN' }, { city: 'Teresina', state: 'PI' }, { city: 'São Bernardo do Campo', state: 'SP' },
  { city: 'Campo Grande', state: 'MS' }, { city: 'Osasco', state: 'SP' }, { city: 'Santo André', state: 'SP' },
  { city: 'João Pessoa', state: 'PB' }, { city: 'Jaboatão dos Guararapes', state: 'PE' }, { city: 'São José dos Campos', state: 'SP' },
  { city: 'Uberlândia', state: 'MG' }, { city: 'Contagem', state: 'MG' }, { city: 'Sorocaba', state: 'SP' },
  { city: 'Ribeirão Preto', state: 'SP' }, { city: 'Cuiabá', state: 'MT' }, { city: 'Feira de Santana', state: 'BA' },
  { city: 'Joinville', state: 'SC' }, { city: 'Florianópolis', state: 'SC' }, { city: 'Aracaju', state: 'SE' },
  { city: 'Londrina', state: 'PR' }, { city: 'Juiz de Fora', state: 'MG' }, { city: 'Porto Velho', state: 'RO' },
  { city: 'Niterói', state: 'RJ' }, { city: 'Ananindeua', state: 'PA' }, { city: 'Macapá', state: 'AP' },
  { city: 'Campos dos Goytacazes', state: 'RJ' }, { city: 'Mauá', state: 'SP' }, { city: 'Caxias do Sul', state: 'RS' },
  { city: 'Vitória', state: 'ES' }, { city: 'Santos', state: 'SP' }
];

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<CalendarEvent>, date: Date) => void;
  courseTypes: CourseType[];
  initialDate: Date;
  initialEvent?: CalendarEvent | null; 
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSave, courseTypes, initialDate, initialEvent }) => {
  const [studentName, setStudentName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  
  const [course, setCourse] = useState('');
  const [eventLocation, setEventLocation] = useState(''); // New State
  const [paymentMethod, setPaymentMethod] = useState('Facilitado');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('09:00');
  const [durationStr, setDurationStr] = useState(''); 
  
  const [valueStr, setValueStr] = useState('');
  const [depositStr, setDepositStr] = useState(''); 
  const [status, setStatus] = useState<'paid' | 'pending'>('pending');
  const [paymentDueDateStr, setPaymentDueDateStr] = useState('');
  const [localPayments, setLocalPayments] = useState<PaymentRecord[]>([]);

  const [eventMaterials, setEventMaterials] = useState<MaterialItem[]>([]);
  const [newMaterialInput, setNewMaterialInput] = useState('');
  
  const [autoDueDays, setAutoDueDays] = useState<number | null>(null);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const selectedCourseConfig = courseTypes.find(c => c.name === course);

  const filteredCities = city.length > 1 
    ? BRAZIL_CITIES.filter(c => c.city.toLowerCase().includes(city.toLowerCase())).slice(0, 5) 
    : [];

  useEffect(() => {
    if (isOpen) {
      if (showConfirmation) return;

      if (initialEvent) {
          setStudentName(initialEvent.student || '');
          setWhatsapp(initialEvent.whatsapp || '');
          setCity(initialEvent.city || '');
          setState(initialEvent.state || '');

          setCourse(initialEvent.title || '');
          setEventLocation(initialEvent.eventLocation || ''); // Load existing location
          setPaymentMethod(initialEvent.paymentMethod || 'Facilitado');
          
          if (initialEvent.date) {
            const d = new Date(initialEvent.date);
            setDateStr(d.toISOString().split('T')[0]);
          }
          
          setTimeStr(initialEvent.time || '00:00');
          setDurationStr(initialEvent.duration || '1h');
          
          setValueStr(initialEvent.value !== undefined && initialEvent.value !== null ? initialEvent.value.toString() : '');
          
          setStatus(initialEvent.paymentStatus || 'pending');
          
          if (initialEvent.paymentDueDate) {
             const d = new Date(initialEvent.paymentDueDate);
             setPaymentDueDateStr(d.toISOString().split('T')[0]);
          } else {
             setPaymentDueDateStr('');
          }
          
          setLocalPayments(initialEvent.payments || []);
          setDepositStr(''); 
          setAutoDueDays(null); 
          
          setEventMaterials(initialEvent.materials || []);

      } else {
          const year = initialDate.getFullYear();
          const month = String(initialDate.getMonth() + 1).padStart(2, '0');
          const day = String(initialDate.getDate()).padStart(2, '0');
          const isoDate = `${year}-${month}-${day}`;
          setDateStr(isoDate);
          setPaymentDueDateStr('');
          
          setStudentName('');
          setWhatsapp('');
          setCity('');
          setState('');
          setCourse('');
          setEventLocation('');
          setPaymentMethod('Facilitado');
          setTimeStr('09:00');
          setDurationStr(''); 
          setValueStr('');
          setDepositStr('');
          setStatus('pending');
          setLocalPayments([]);
          setAutoDueDays(null);
          setEventMaterials([]);
      }
      setShowCitySuggestions(false);
      setIsCopied(false);
    } else {
      setShowConfirmation(false);
    }
  }, [isOpen, initialEvent]);

  useEffect(() => {
    if (autoDueDays !== null && dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const baseDate = new Date(year, month - 1, day);
        
        baseDate.setDate(baseDate.getDate() - autoDueDays);
        
        const y = baseDate.getFullYear();
        const m = String(baseDate.getMonth() + 1).padStart(2, '0');
        const d = String(baseDate.getDate()).padStart(2, '0');
        
        setPaymentDueDateStr(`${y}-${m}-${d}`);
    }
  }, [dateStr, autoDueDays]);


  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedName = e.target.value;
      const config = courseTypes.find(c => c.name === selectedName);
      
      setCourse(selectedName);
      
      if (config) {
          const shouldUpdateDetails = !initialEvent || window.confirm('Deseja atualizar Horário para o padrão deste curso?');
          
          if (shouldUpdateDetails) {
              if (config.defaultTime) setTimeStr(config.defaultTime);
          }
          
          if (config.defaultDuration) setDurationStr(config.defaultDuration);
          if (config.defaultValue) setValueStr(config.defaultValue.toString());
          
          if (!initialEvent || window.confirm('Deseja carregar a lista de materiais padrão deste curso?')) {
             if (config.defaultMaterials && config.defaultMaterials.length > 0) {
                 const newMaterials = config.defaultMaterials.map(m => ({
                     id: Date.now() + Math.random().toString(),
                     name: m.name,
                     cost: 0, // Initialize with 0 for manual input later
                     checked: false
                 }));
                 setEventMaterials(newMaterials);
             } else {
                 setEventMaterials([]);
             }
          }
      }
  };

  const handleCitySelect = (selectedCity: { city: string, state: string }) => {
      setCity(selectedCity.city);
      setState(selectedCity.state);
      setShowCitySuggestions(false);
  };

  const removePayment = (id: string) => {
      if (window.confirm('Tem certeza que deseja excluir?')) {
          setLocalPayments(prev => prev.filter(p => p.id !== id));
      }
  };
  
  const addMaterial = () => {
      if (!newMaterialInput.trim()) return;
      setEventMaterials([...eventMaterials, {
          id: Date.now().toString(),
          name: newMaterialInput.trim(),
          checked: false,
          cost: 0 // Manual cost starts at 0
      }]);
      setNewMaterialInput('');
  };

  const removeMaterial = (id: string) => {
      setEventMaterials(prev => prev.filter(m => m.id !== id));
  };

  const handleSetDueDays = (days: number) => {
      setAutoDueDays(days); 
  };

  const getActiveDueDays = () => {
    if (autoDueDays !== null) return autoDueDays;

    if (!paymentDueDateStr || !dateStr) return null;
    
    const [eYear, eMonth, eDay] = dateStr.split('-').map(Number);
    const eventDate = new Date(eYear, eMonth - 1, eDay);
    eventDate.setHours(12, 0, 0, 0);

    const [dYear, dMonth, dDay] = paymentDueDateStr.split('-').map(Number);
    const dueDate = new Date(dYear, dMonth - 1, dDay);
    dueDate.setHours(12, 0, 0, 0);
    
    const diffTime = eventDate.getTime() - dueDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getFormattedDueDate = () => {
     if(!paymentDueDateStr) return '';
     const [y, m, d] = paymentDueDateStr.split('-').map(Number);
     const date = new Date(y, m - 1, d);
     return date.toLocaleDateString('pt-BR');
  };

  const generateShareMessage = () => {
    let formattedDate = '';
    let dayOfWeek = '';
    
    if (dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        
        formattedDate = dateObj.toLocaleDateString('pt-BR');
        dayOfWeek = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
    }

    const locationText = eventLocation ? `Local: ${eventLocation}` : 'Endereço: Rua Francisco Antônio Miranda, N°58 - Guarulhos SP. Sala 6.';

    return `Parabéns pela sua aquisição no curso! O seu curso de ${course} foi agendado para o dia ${formattedDate} (${dayOfWeek}) às ${timeStr}.

${locationText}`;
  };

  const handleCopyText = () => {
      navigator.clipboard.writeText(generateShareMessage());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const handleWhatsApp = () => {
      if (!whatsapp) return;
      const cleanNumber = whatsapp.replace(/\D/g, '');
      const finalNumber = cleanNumber.length <= 11 ? `55${cleanNumber}` : cleanNumber;
      const text = generateShareMessage();
      window.open(`https://wa.me/${finalNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !course || !dateStr || !city || !state || !whatsapp) return;

    const [year, month, day] = dateStr.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);

    let dueDate: Date | undefined = undefined;
    if (paymentDueDateStr) {
        const [dYear, dMonth, dDay] = paymentDueDateStr.split('-').map(Number);
        dueDate = new Date(dYear, dMonth - 1, dDay);
    }

    const totalValue = parseFloat(valueStr.replace(',', '.')) || 0;
    const depositValue = parseFloat(depositStr.replace(',', '.')) || 0;
    let finalPayments = [...localPayments];
    
    if (depositValue > 0) {
        finalPayments.push({
            id: Date.now().toString() + Math.random().toString().slice(2, 8),
            amount: depositValue,
            date: new Date() 
        });
    }

    const totalPaid = finalPayments.reduce((acc, p) => acc + p.amount, 0);
    
    let finalStatus: 'paid' | 'pending' = 'pending';
    
    if (totalValue > 0 && totalPaid >= (totalValue - 0.01)) {
        finalStatus = 'paid';
    }

    onSave({
      title: course,
      student: studentName,
      whatsapp: whatsapp,
      city: city,
      state: state,
      eventLocation: eventLocation, // Save Location
      time: timeStr,
      duration: durationStr, 
      type: 'class',
      value: totalValue, 
      paymentMethod: paymentMethod,
      paymentStatus: finalStatus,
      paymentDueDate: dueDate,
      payments: finalPayments,
      materials: eventMaterials 
    }, selectedDate);

    setShowConfirmation(true);
  };
  
  const todayStr = new Date().toISOString().split('T')[0];
  const isInitialDatePast = new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
  const minDate = isInitialDatePast ? undefined : todayStr;
  
  const activeDays = getActiveDueDays();

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto transform transition-all scale-100 max-h-[90vh] overflow-y-auto no-scrollbar relative">
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors z-10"
          >
            <XIcon className="w-5 h-5" />
          </button>

          {showConfirmation ? (
              <div className="p-6 pt-12 flex flex-col items-center text-center animate-fade-in">
                  
                  <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                          Agendamento Confirmado!
                      </h2>
                  </div>

                  <div className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 text-left">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Pré-visualização da mensagem</p>
                      <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                          {generateShareMessage()}
                      </p>
                  </div>

                  <div className="w-full flex gap-3">
                      <button
                          onClick={handleWhatsApp}
                          className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all transform active:scale-[0.98]"
                      >
                          <WhatsAppIcon className="w-5 h-5" />
                          <span className="text-sm">WhatsApp</span>
                      </button>
                      
                      <button
                          onClick={handleCopyText}
                          className={`flex-1 py-3 border-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                              ${isCopied 
                                  ? 'border-green-500 text-green-500 bg-green-50 dark:bg-green-900/10' 
                                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                              }`}
                      >
                          {isCopied ? (
                              <> <CheckIcon className="w-5 h-5" /> <span className="text-sm">Copiado!</span> </>
                          ) : (
                              <span className="text-sm">Copiar</span>
                          )}
                      </button>
                  </div>
              </div>
          ) : (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                {initialEvent ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome da Aluna *
                </label>
                <input 
                  type="text" 
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Ana Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  WhatsApp *
                </label>
                <div className="relative">
                    <input 
                    type="tel" 
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pl-11"
                    placeholder="(00) 00000-0000"
                    />
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cidade (Aluna)
                    </label>
                    <input 
                      type="text"
                      required
                      value={city}
                      onFocus={() => setShowCitySuggestions(true)}
                      onChange={(e) => {
                          setCity(e.target.value);
                          setShowCitySuggestions(true);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="Busque..."
                    />
                    {showCitySuggestions && filteredCities.length > 0 && (
                        <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                            {filteredCities.map((c, idx) => (
                                <li 
                                    key={idx}
                                    onClick={() => handleCitySelect(c)}
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer text-sm text-gray-700 dark:text-gray-200 flex items-center justify-between"
                                >
                                    <span>{c.city}</span>
                                    <span className="text-xs text-gray-400 font-bold">{c.state}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estado
                    </label>
                    <input 
                      type="text"
                      required
                      value={state}
                      maxLength={2}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="UF"
                    />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome do Evento *
                    </label>
                    <div className="relative">
                      <select 
                        required
                        value={course}
                        onChange={handleCourseChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none transition-all"
                      >
                        <option value="" disabled>Selecione...</option>
                        {courseTypes.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                        {courseTypes.length === 0 && <option value="" disabled>Nenhum evento cadastrado</option>}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Modelo do Evento
                    </label>
                    <input 
                        type="text"
                        readOnly
                        value={selectedCourseConfig?.model || ''}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 focus:outline-none cursor-not-allowed"
                        placeholder="Automático"
                    />
                  </div>
              </div>
              
              {/* NEW FIELD: Local do Evento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Local do Evento
                </label>
                <div className="relative">
                    <input 
                      type="text"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pl-10"
                      placeholder="Ex: Sala 01, Studio, Endereço completo..."
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <MapPinIcon className="w-5 h-5" />
                    </div>
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duração
                      </label>
                      <input 
                        type="text" 
                        readOnly
                        value={durationStr}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 focus:outline-none cursor-not-allowed"
                        placeholder="Automático"
                      />
                 </div>
                 <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Valor do Curso
                      </label>
                      <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R$</span>
                          <input 
                            type="number" 
                            step="0.01"
                            readOnly
                            value={valueStr}
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium focus:outline-none cursor-not-allowed"
                            placeholder="0,00"
                          />
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data de Início
                    </label>
                    <input 
                      type="date" 
                      required
                      min={initialEvent ? undefined : minDate}
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                 </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Horário
                  </label>
                  <input 
                    type="time" 
                    required
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                 </div>
              </div>

              {initialEvent && (
                  <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                         <BoxIcon className="w-4 h-4 text-gray-500" />
                         Lista de Materiais para a Aluna
                      </label>
                      
                      <div className="flex gap-2 mb-3">
                          <input 
                            type="text" 
                            value={newMaterialInput}
                            onChange={(e) => setNewMaterialInput(e.target.value)}
                            placeholder="Adicionar item extra..."
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                          />
                          <button 
                            type="button"
                            onClick={addMaterial}
                            className="p-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg text-gray-600 dark:text-gray-300"
                          >
                             <PlusIcon className="w-4 h-4" />
                          </button>
                      </div>

                      {eventMaterials.length === 0 ? (
                          <p className="text-xs text-gray-400 italic text-center py-2">Nenhum material listado.</p>
                      ) : (
                          <ul className="space-y-1">
                              {eventMaterials.map(m => (
                                  <li key={m.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-white/5 rounded-lg group">
                                      <span className="text-gray-700 dark:text-gray-300">{m.name}</span>
                                      <button 
                                        type="button"
                                        onClick={() => removeMaterial(m.id)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                          <XIcon className="w-4 h-4" />
                                      </button>
                                  </li>
                              ))}
                          </ul>
                      )}
                  </div>
              )}

              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-4">
                      <DollarSignIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">FORMAS DE PAGAMENTO</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sinal / Valor Total
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R$</span>
                                <input 
                                    type="number"
                                    step="0.01" 
                                    value={depositStr}
                                    onChange={(e) => setDepositStr(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="0,00"
                                />
                            </div>
                      </div>

                       <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Método
                            </label>
                            <div className="relative">
                            <select 
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark text-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none transition-all"
                            >
                                <option value="Facilitado">Facilitado</option>
                                <option value="Pix">Pix</option>
                                <option value="Cartão">Cartão</option>
                                <option value="Dinheiro">Dinheiro</option>
                            </select>
                            </div>
                       </div>
                  </div>
              </div>
               
               {initialEvent && localPayments.length > 0 && (
                   <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Histórico Já Lançado</p>
                        <ul className="space-y-2">
                            {localPayments.map(p => (
                                <li key={p.id} className="flex justify-between items-center text-sm bg-white dark:bg-surface-dark p-2 rounded-lg shadow-sm">
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {new Date(p.date).toLocaleDateString('pt-BR')} - <strong>R$ {p.amount.toFixed(2)}</strong>
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            removePayment(p.id);
                                        }}
                                        className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                        title="Remover Pagamento"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                   </div>
               )}

               <div className="pt-2">
                 <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-3">
                    <button
                        type="button"
                        onClick={() => setStatus('paid')}
                        className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            status === 'paid' 
                            ? 'bg-white dark:bg-surface-dark text-green-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Pago
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatus('pending')}
                        className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            status === 'pending' 
                            ? 'bg-white dark:bg-surface-dark text-red-500 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <AlertCircleIcon className="w-4 h-4 mr-2" />
                        Pendente
                    </button>
                 </div>

                 {status === 'pending' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Prazo para Quitação
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[5, 10, 15].map((days) => {
                                const isActive = activeDays === days;
                                return (
                                    <button
                                        key={days}
                                        type="button"
                                        onClick={() => handleSetDueDays(days)}
                                        className={`py-3 px-3 rounded-xl text-sm font-bold border transition-all shadow-sm
                                            ${isActive 
                                                ? 'bg-primary text-white border-primary shadow-primary/30' 
                                                : 'bg-white dark:bg-transparent border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        {days} Dias
                                    </button>
                                )
                            })}
                        </div>
                        {paymentDueDateStr && (
                             <p className="text-xs text-center text-gray-400 mt-2 bg-gray-50 dark:bg-white/5 py-2 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                Vence dia: <strong className="text-gray-700 dark:text-gray-200">{getFormattedDueDate()}</strong>
                             </p>
                        )}
                    </div>
                 )}
               </div>

              <div className="flex gap-3 mt-8 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-bold shadow-lg hover:bg-red-600 transition-all uppercase tracking-wide text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold shadow-lg hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wide text-sm whitespace-nowrap"
                >
                  {initialEvent ? 'SALVAR ALTERAÇÕES' : 'AGENDAR'}
                </button>
              </div>

            </form>
          </div>
          )}
        </div>
      </div>
    </>
  );
};
