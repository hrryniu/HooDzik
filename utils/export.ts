import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Workout, UserProfile } from '@/store/useStore';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale/pl';

/**
 * Export workouts to PDF
 */
export function exportWorkoutsToPDF(
  workouts: Workout[],
  userProfile: UserProfile,
  timeRangeLabel: string
) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(24);
  doc.setTextColor(0, 243, 255);
  doc.text('HooDzik', 20, 20);

  // Subtitle
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text('Raport Treningowy', 20, 30);

  // Date and period
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Data wygenerowania: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: pl })}`, 20, 40);
  doc.text(`Okres: ${timeRangeLabel}`, 20, 46);

  // User profile section
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Profil Użytkownika', 20, 60);

  doc.setFontSize(10);
  const profileData = [
    ['Waga aktualna', `${userProfile.weight} kg`],
    ['Waga docelowa', `${userProfile.targetWeight} kg`],
    ['Wzrost', `${userProfile.height} cm`],
    ['Wiek', `${userProfile.age} lat`],
    ['Tłuszcz', `${userProfile.bodyFat}%`],
    ['Płeć', userProfile.gender === 'male' ? 'Mężczyzna' : 'Kobieta'],
  ];

  autoTable(doc, {
    startY: 65,
    head: [['Parametr', 'Wartość']],
    body: profileData,
    theme: 'grid',
    headStyles: { fillColor: [0, 200, 255] },
    margin: { left: 20 },
    tableWidth: 80,
  });

  // Summary statistics
  const totalCalories = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  const totalDistance = workouts.reduce((sum, w) => sum + (w.distance || 0), 0);
  const avgDuration = workouts.length > 0
    ? workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length
    : 0;

  doc.setFontSize(14);
  doc.text('Podsumowanie', 120, 60);

  const summaryData = [
    ['Liczba treningów', workouts.length.toString()],
    ['Łączne kalorie', `${totalCalories.toFixed(0)} kcal`],
    ['Łączny dystans', `${totalDistance.toFixed(1)} km`],
    ['Średni czas', `${avgDuration.toFixed(0)} min`],
  ];

  autoTable(doc, {
    startY: 65,
    head: [['Statystyka', 'Wartość']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [0, 255, 136] },
    margin: { left: 120 },
    tableWidth: 70,
  });

  // Workouts table
  doc.setFontSize(14);
  doc.text('Historia Treningów', 20, (doc as any).lastAutoTable.finalY + 20);

  const workoutsData = workouts.map((w) => [
    format(new Date(w.date), 'dd.MM.yyyy', { locale: pl }),
    w.type,
    `${w.duration} min`,
    `${w.caloriesBurned} kcal`,
    w.distance ? `${w.distance.toFixed(1)} km` : '-',
    w.heartRate ? `${w.heartRate} bpm` : '-',
    w.source === 'xiaomi' ? 'Xiaomi' : 'Ręczne',
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 25,
    head: [['Data', 'Typ', 'Czas', 'Kalorie', 'Dystans', 'Tętno', 'Źródło']],
    body: workoutsData,
    theme: 'striped',
    headStyles: { fillColor: [0, 243, 255] },
    styles: { fontSize: 8 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Strona ${i} z ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`hoodzik-raport-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

/**
 * Export workouts to CSV
 */
export function exportWorkoutsToCSV(workouts: Workout[]) {
  const headers = ['Data', 'Typ', 'Czas (min)', 'Kalorie (kcal)', 'Dystans (km)', 'Tętno (bpm)', 'Źródło'];
  
  const rows = workouts.map((w) => [
    format(new Date(w.date), 'yyyy-MM-dd'),
    w.type,
    w.duration.toString(),
    w.caloriesBurned.toString(),
    w.distance?.toString() || '',
    w.heartRate?.toString() || '',
    w.source === 'xiaomi' ? 'Xiaomi' : 'Ręczne',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `hoodzik-treningi-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

