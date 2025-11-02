# 🚀 NeoFit Monitor

Nowoczesna, futurystyczna aplikacja desktopowa/webowa do zarządzania zdrowiem, dietą i procesem odchudzania użytkownika.

![NeoFit Monitor](https://img.shields.io/badge/Status-Active-brightgreen)
![Version](https://img.shields.io/badge/Version-0.1.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Funkcje

### 🎨 Interaktywny Model 3D
- **Wizualizacja 3D**: Półprzezroczysty model człowieka w formie wireframe
- **Obracanie myszką**: Pełna interaktywność - przeciągnij, aby obrócić, scroll aby przybliżyć
- **Dynamiczne dopasowanie**: Model zmienia się w czasie rzeczywistym na podstawie parametrów użytkownika (płeć, wzrost, waga, typ budowy)
- **Efekt oddychania**: Delikatna animacja nadająca modelowi holograficzny charakter
- **Platforma holograficzna**: Futurystyczna podstawa z efektami świetlnymi

### 📊 Panele z danymi zdrowotnymi
- Aktualna waga i waga docelowa
- Procent tłuszczu w ciele
- Wskaźnik BMI z kategoryzacją
- Spalone kalorie w bieżącym miesiącu
- Przebiegany dystans
- Dzienny bilans kaloryczny
- Wizualny pasek postępu do celu

### 🏃 Zakładka Treningi
- **Lista treningów**: Kompletna historia z datami, czasem, kaloriami, dystansem
- **Ręczne dodawanie**: Formularz do wprowadzania własnych treningów
- **Integracja Bluetooth**: Połączenie z zegarkiem Xiaomi Redmi Smart Band Pro
- **Automatyczna synchronizacja**: Import danych z urządzenia (tętno, kroki, dystans, sen)
- **Statystyki podsumowujące**: Łączne wartości dla wszystkich treningów

### 📈 Zakładka Statystyki
- **Wykresy interaktywne**: Wizualizacja postępów w czasie
- **Filtry czasowe**: 7, 30 lub 90 dni
- **Analiza trendów**: Automatyczne wykrywanie postępów lub regresu
- **Rozkład typów treningów**: Diagram kołowy pokazujący proporcje aktywności
- **Eksport do PDF**: Generowanie raportów z pełnymi danymi

### 👤 Zakładka Profil
- **Dane osobiste**: Płeć, wiek, wzrost, waga
- **Cele treningowe**: Ustalanie wagi docelowej
- **Typ budowy ciała**: Wybór między ektomorfikiem, mezomorfikiem, endomorfikiem
- **Wskaźniki zdrowia**: BMI z kategoryzacją (niedowaga, norma, nadwaga, otyłość)
- **Aktualizacja na żywo**: Zmiany w profilu natychmiast wpływają na model 3D

## 🛠️ Technologie

### Frontend
- **Framework**: Next.js 14.2 z React 18.3
- **3D Rendering**: Three.js + React Three Fiber
- **Styling**: Tailwind CSS z custom neonowym motywem
- **Animacje**: Framer Motion
- **Wykresy**: Chart.js + React-Chart.js-2
- **TypeScript**: Pełne typowanie dla bezpieczeństwa kodu

### State Management
- **Zustand**: Lekkie i wydajne zarządzanie stanem
- **Persist**: Automatyczne zapisywanie danych w localStorage

### Integracja sprzętowa
- **Web Bluetooth API**: Komunikacja z zegarkiem Xiaomi
- **Real-time sync**: Automatyczny import danych treningowych

### Export danych
- **jsPDF**: Generowanie raportów PDF
- **jsPDF-AutoTable**: Tabele w dokumentach PDF

## 🎨 Design

Interfejs inspirowany futurystycznymi filmami sci-fi:
- **Tron**: Neonowe linie i geometryczne kształty
- **Oblivion**: Minimalistyczne, półprzezroczyste panele
- **Minority Report**: Holograficzne projekcje i gestykulacja

### Paleta kolorów
- **Neon Blue**: `#00f3ff` - Główny kolor akcentu
- **Neon Cyan**: `#00ffff` - Akcenty drugorzędne
- **Neon Green**: `#00ff88` - Pozytywne wskaźniki
- **Dark Background**: `#0a0e17` - Głęboki ciemny backgrounds
- **Glass Panels**: Przezroczyste panele z blur effect

## 🚀 Instalacja i uruchomienie

### Wymagania
- Node.js 18+ 
- npm lub yarn
- Przeglądarka wspierająca Web Bluetooth API (Chrome, Edge, Opera)

### Krok po kroku

1. **Instalacja zależności**
```bash
npm install
```

2. **Uruchomienie w trybie deweloperskim**
```bash
npm run dev
```

3. **Otwórz przeglądarkę**
```
http://localhost:3001
```

4. **Build produkcyjny**
```bash
npm run build
npm start
```

## 📱 Połączenie z zegarkiem Xiaomi

1. Włącz Bluetooth w przeglądarce i na zegarku
2. W aplikacji przejdź do zakładki "Treningi"
3. Kliknij "Połącz zegarek"
4. Wybierz swoje urządzenie Xiaomi z listy
5. Dane treningowe będą automatycznie synchronizowane

**Uwaga**: Web Bluetooth API jest dostępne tylko w:
- Chrome 56+
- Edge 79+
- Opera 43+
- (Nie działa w Firefox i Safari)

## 📊 Eksport danych

### PDF
- Przejdź do zakładki "Statystyki"
- Wybierz okres (7/30/90 dni)
- Kliknij "Eksportuj PDF"
- Raport zawiera: profil użytkownika, listę treningów, statystyki

### CSV (planowane)
Funkcja w przygotowaniu - będzie dostępna w kolejnej wersji

## 🎯 Roadmap

### Wersja 0.2.0 (planowana)
- [ ] Integracja z Google Fit / Apple Health
- [ ] Zaawansowane planowanie treningów
- [ ] System powiadomień i przypomnień
- [ ] Tryb ciemny/jasny (toggle)
- [ ] Więcej typów wykresów (radar, heatmap)

### Wersja 0.3.0 (planowana)
- [ ] Dieta i licznik kalorii
- [ ] Baza przepisów
- [ ] Plan żywieniowy
- [ ] Integracja z wagą Bluetooth
- [ ] Aplikacja mobilna (React Native)

### Wersja 1.0.0 (planowana)
- [ ] Backend z Node.js + Express
- [ ] Baza danych (PostgreSQL / MongoDB)
- [ ] Konta użytkowników i autoryzacja
- [ ] Synchronizacja w chmurze
- [ ] Aplikacja desktop (Electron)

## 🤝 Wkład w projekt

Jeśli chcesz przyczynić się do rozwoju projektu:

1. Fork repozytorium
2. Stwórz branch z feature (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📄 Licencja

Projekt na licencji MIT. Zobacz plik `LICENSE` dla szczegółów.

## 👨‍💻 Autor

Projekt stworzony jako showcase nowoczesnych technologii webowych i 3D.

## 🙏 Podziękowania

- **Three.js team** - za niesamowitą bibliotekę 3D
- **Vercel** - za Next.js framework
- **Tailwind Labs** - za Tailwind CSS
- **Społeczność open source** - za wszystkie wykorzystane biblioteki

## 📞 Kontakt

Masz pytania lub sugestie? Otwórz issue na GitHubie!

---

**Zbuduj swoją przyszłość z NeoFit Monitor** 🚀💪✨


