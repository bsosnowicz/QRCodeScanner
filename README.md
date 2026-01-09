# AttendMe - System sprawdzania obecności

Aplikacja SPA do sprawdzania obecności na zajęciach z wykorzystaniem kodów QR.

## Technologie

- Vue.js 3 (Composition API)
- TypeScript
- Vue Router
- Pinia
- Axios
- qrcode.vue (generowanie kodów QR)
- vue-qrcode-reader (odczyt kodów QR)

## Instalacja

```bash
npm install
```

## Uruchomienie

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`

## Budowanie

```bash
npm run build
```

## Funkcjonalności

### Wykładowca
- Logowanie
- Pulpit z listą zajęć (filtrowanie)
- Szczegóły zajęć z listą obecności
- Skanowanie kodów QR do rejestracji obecności

### Student
- Logowanie
- Rejestracja urządzenia (przez link aktywacyjny)
- Pulpit z listą zajęć (filtrowanie)
- Szczegóły zajęć z frekwencją
- Generowanie kodu QR do obecności

## Backend

Backend aplikacji dostępny jest pod adresem:
https://attendme-backend.runasp.net/

Dokumentacja API: https://attendme-backend.runasp.net/swagger/index.html

