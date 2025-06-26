# urlShortener-backend

projeyi `docker-compose up --build` ile ayağa kaldırdıktan sonra 3000 portundan kendi yerel adresiniz ile erişebilirsiniz.

### urlController endpointleri
 -POST
 
    /api/shorten


| parametre | tip |  değer|  
|--|--|--|--|--|
|  originalUrl | `string` |  kısaltılmak istenen link. http(s):// formatıyla başlamalı (req)|
|  customAlias| `string` |   manuel bir kod verilmek istenirse girilir (optional)|




-GET
 
    /api/stats/:shortCode

istenen linke ait tıklanma verisi, create ve expire tarihi bilgisi döner




