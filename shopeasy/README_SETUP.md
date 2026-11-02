# ShopEasy (React + Spring Boot + MySQL)

## Project folders
- `shopeasy/` — Spring Boot REST API (Java 23, Maven, Spring Security, JWT, JPA)
- `shopeasy-frontend/` — React + Vite frontend

## Requirements
- JDK 23
- MySQL Server 8
- Node.js 22.12+ (recommended for Vite 8)
- npm

## 1. Create the MySQL database and application user
Open MySQL Workbench using an administrator account and run this SQL.
Choose your own strong password and use the same password in the backend environment variable.

```sql
CREATE DATABASE IF NOT EXISTS shopeasy;
CREATE USER IF NOT EXISTS 'shopeasy_user'@'localhost' IDENTIFIED BY 'ChooseYourOwnStrongPassword';
GRANT ALL PRIVILEGES ON shopeasy.* TO 'shopeasy_user'@'localhost';
FLUSH PRIVILEGES;
```

If the user already exists, update its password with `ALTER USER` using a password you choose.
Do not commit passwords to Git or share them in screenshots.

## 2. Start the backend (PowerShell)
```powershell
cd .\shopeasy
$env:DB_USERNAME = "shopeasy_user"
$secure = Read-Host "Enter the MySQL password" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try { $env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
$env:JWT_SECRET = "ReplaceThisWithAUniqueLongRandomSecretOfAtLeast32Characters"
.\mvnw.cmd spring-boot:run
```
Keep this terminal open. The API runs at `http://localhost:8080`.
Test products at `http://localhost:8080/api/products`. The sample catalog seeds 36 products on first start and adds any missing sample products on later starts.

## 3. Start the frontend (a second PowerShell terminal)
```powershell
cd .\shopeasy-frontend
npm ci
npm run dev
```
Open `http://localhost:5173`.

## Implemented in this supplied codebase
- Product catalog and product details
- Register and login with BCrypt password hashing and JWT
- Cart state/context
- Checkout using Cash on Delivery
- Order history, order detail, cancellation while pending
- Admin product creation and order listing/status updates (requires an ADMIN user)
- Sample product seeder (36 sample products)

## Not yet implemented in this supplied codebase
- Wishlist persistence and wishlist page
- Product editing/deletion and admin-user provisioning workflow
- Online payment gateway integration
- Shipment carrier/live tracking integration
- Product reviews and ratings
- Full user profile/address book

The project is prepared as a runnable development baseline; these items should not be represented as completed until implemented and tested.
