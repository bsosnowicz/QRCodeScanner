# AttendMe - System sprawdzania obecności

Aplikacja SPA do sprawdzania obecności na zajęciach z wykorzystaniem kodów QR.

### Kluczowe uwagi
- Czasem występuje błąd, który powoduje błąd przy zalogowaniu mimo wprowadzenia poprwanych danych (nie wyskakuje żaden błąd). W takiej sytuacji należy przeładować stronę i zalogować się jeszcze raz, wtedy powinno wszystko działać
- Sam projekt wrzucilismy również na hosting netlify:
https://aquamarine-clafoutis-71a644.netlify.app/#/login

## Technologie

- Vue.js 3 (Composition API)
- TypeScript
- Vue Router
- Pinia
- Axios
- qrcode.vue (generowanie kodów QR)
- vue-qrcode-reader (odczyt kodów QR)

## Instalacja

npm install

## Uruchomienie

npm run dev

Aplikacja będzie dostępna pod adresem `http://localhost:3000`

## Budowanie

npm run build

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