class PhotoCallApp {
    constructor() {
        this.canvas = document.getElementById('photoCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.frameImage = new Image();
        this.userImage = null;
        this.isFrameLoaded = false;
        this.countries = {};

        this.initializeElements();
        this.loadFrame();
        this.loadCountries();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupMobileHelp();
    }

    initializeElements() {
        this.fileInput = document.getElementById('fileInput');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.previewOverlay = document.getElementById('previewOverlay');
        this.uploadArea = document.getElementById('uploadArea');
        this.canvasContainer = document.querySelector('.canvas-container');

        this.firstNameInput = document.getElementById('firstName');
        this.lastNameInput = document.getElementById('lastName');
        this.countryInput = document.getElementById('country');
    }

    loadFrame() {
        this.frameImage.onload = () => {
            console.log('Frame image loaded successfully');
            console.log('Frame dimensions:', this.frameImage.naturalWidth, 'x', this.frameImage.naturalHeight);
            this.isFrameLoaded = true;
            this.canvas.width = this.frameImage.naturalWidth;
            this.canvas.height = this.frameImage.naturalHeight;
            this.resizeCanvas();
            this.drawCanvas();
        };

        this.frameImage.onerror = (error) => {
            console.error('Failed to load frame image:', error);
            // Créer un cadre de base si l'image ne se charge pas
            this.createBasicFrame();
        };

        this.frameImage.crossOrigin = 'anonymous';
        this.frameImage.src = './frame.png';
    }

    loadCountries() {
        // Charger les pays directement depuis les options du HTML
        const countrySelect = document.getElementById('country');
        this.countries = {};


        // Parcourir toutes les options du select pour créer le mapping
        for (let i = 1; i < countrySelect.options.length; i++) {
            const option = countrySelect.options[i];
            this.countries[option.value] = option.textContent;
        }

        console.log(`Country list loaded from HTML with ${Object.keys(this.countries).length} countries`);
    }

    getCountryCode(countryName) {
        for (const code in this.countries) {
            if (this.countries[code] === countryName) {
                return code;
            }
        }
        return null;
    }

    getCountryFlag(countryName) {
        // Mapping complet de tous les pays vers leurs emojis de drapeaux
        const countryFlags = {
            'Afghanistan': '🇦🇫', 'Albania': '🇦🇱', 'Algeria': '🇩🇿', 'Andorra': '🇦🇩', 'Angola': '🇦🇴',
            'Antigua and Barbuda': '🇦🇬', 'Argentina': '🇦🇷', 'Armenia': '🇦🇲', 'Australia': '🇦🇺', 'Austria': '🇦🇹',
            'Azerbaijan': '🇦🇿', 'Bahamas': '🇧🇸', 'Bahrain': '🇧🇭', 'Bangladesh': '🇧🇩', 'Barbados': '🇧🇧',
            'Belarus': '🇧🇾', 'Belgium': '🇧🇪', 'Belize': '🇧🇿', 'Benin': '🇧🇯', 'Bhutan': '🇧🇹',
            'Bolivia': '🇧🇴', 'Bosnia and Herzegovina': '🇧🇦', 'Botswana': '🇧🇼', 'Brazil': '🇧🇷', 'Brunei': '🇧🇳',
            'Bulgaria': '🇧🇬', 'Burkina Faso': '🇧🇫', 'Burundi': '🇧🇮', 'Cambodia': '🇰🇭', 'Cameroon': '🇨🇲',
            'Canada': '🇨🇦', 'Cape Verde': '🇨🇻', 'Central African Republic': '🇨🇫', 'Chad': '🇹🇩', 'Chile': '🇨🇱',
            'China': '🇨🇳', 'Colombia': '🇨🇴', 'Comoros': '🇰🇲', 'Congo': '🇨🇬', 'Democratic Republic of Congo': '🇨🇩',
            'Costa Rica': '🇨🇷', 'Cote d\'Ivoire': '🇨🇮', 'Croatia': '🇭🇷', 'Cuba': '🇨🇺', 'Cyprus': '🇨🇾',
            'Czech Republic': '🇨🇿', 'Denmark': '🇩🇰', 'Djibouti': '🇩🇯', 'Dominica': '🇩🇲', 'Dominican Republic': '🇩🇴',
            'East Timor': '🇹🇱', 'Ecuador': '🇪🇨', 'Egypt': '🇪🇬', 'El Salvador': '🇸🇻', 'Equatorial Guinea': '🇬🇶',
            'Eritrea': '🇪🇷', 'Estonia': '🇪🇪', 'Eswatini': '🇸🇿', 'Ethiopia': '🇪🇹', 'Fiji': '🇫🇯',
            'Finland': '🇫🇮', 'France': '🇫🇷', 'Gabon': '🇬🇦', 'Gambia': '🇬🇲', 'Georgia': '🇬🇪',
            'Germany': '🇩🇪', 'Ghana': '🇬🇭', 'Greece': '🇬🇷', 'Grenada': '🇬🇩', 'Guatemala': '🇬🇹',
            'Guinea': '🇬🇳', 'Guinea-Bissau': '🇬🇼', 'Guyana': '🇬🇾', 'Haiti': '🇭🇹', 'Honduras': '🇭🇳',
            'Hungary': '🇭🇺', 'Iceland': '🇮🇸', 'India': '🇮🇳', 'Indonesia': '🇮🇩', 'Iran': '🇮🇷',
            'Iraq': '🇮🇶', 'Ireland': '🇮🇪', 'Israel': '🇮🇱', 'Italy': '🇮🇹', 'Jamaica': '🇯🇲',
            'Japan': '🇯🇵', 'Jordan': '🇯🇴', 'Kazakhstan': '🇰🇿', 'Kenya': '🇰🇪', 'Kiribati': '🇰🇮',
            'Kuwait': '🇰🇼', 'Kyrgyzstan': '🇰🇬', 'Laos': '🇱🇦', 'Latvia': '🇱🇻', 'Lebanon': '🇱🇧',
            'Lesotho': '🇱🇸', 'Liberia': '🇱🇷', 'Libya': '🇱🇾', 'Liechtenstein': '🇱🇮', 'Lithuania': '🇱🇹',
            'Luxembourg': '🇱🇺', 'Madagascar': '🇲🇬', 'Malawi': '🇲🇼', 'Malaysia': '🇲🇾', 'Maldives': '🇲🇻',
            'Mali': '🇲🇱', 'Malta': '🇲🇹', 'Marshall Islands': '🇲🇭', 'Mauritania': '🇲🇷', 'Mauritius': '🇲🇺',
            'Mexico': '🇲🇽', 'Micronesia': '🇫🇲', 'Moldova': '🇲🇩', 'Monaco': '🇲🇨', 'Mongolia': '🇲🇳',
            'Montenegro': '🇲🇪', 'Morocco': '🇲🇦', 'Mozambique': '🇲🇿', 'Myanmar': '🇲🇲', 'Namibia': '🇳🇦',
            'Nauru': '🇳🇷', 'Nepal': '🇳🇵', 'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿', 'Nicaragua': '🇳🇮',
            'Niger': '🇳🇪', 'Nigeria': '🇳🇬', 'North Korea': '🇰🇵', 'Norway': '🇳🇴', 'Oman': '🇴🇲',
            'Pakistan': '🇵🇰', 'Palau': '🇵🇼', 'Panama': '🇵🇦', 'Papua New Guinea': '🇵🇬', 'Paraguay': '🇵🇾',
            'Peru': '🇵🇪', 'Philippines': '🇵🇭', 'Poland': '🇵🇱', 'Portugal': '🇵🇹', 'Qatar': '🇶🇦',
            'Romania': '🇷🇴', 'Russia': '🇷🇺', 'Rwanda': '🇷🇼', 'Saint Kitts and Nevis': '🇰🇳', 'Saint Lucia': '🇱🇨',
            'Saint Vincent and the Grenadines': '🇻🇨', 'Samoa': '🇼🇸', 'San Marino': '🇸🇲', 'Sao Tome and Principe': '🇸🇹',
            'Saudi Arabia': '🇸🇦', 'Senegal': '🇸🇳', 'Serbia': '🇷🇸', 'Seychelles': '🇸🇨', 'Sierra Leone': '🇸🇱',
            'Singapore': '🇸🇬', 'Slovakia': '🇸🇰', 'Slovenia': '🇸🇮', 'Solomon Islands': '🇸🇧', 'Somalia': '🇸🇴',
            'South Africa': '🇿🇦', 'South Korea': '🇰🇷', 'South Sudan': '🇸🇸', 'Spain': '🇪🇸', 'Sri Lanka': '🇱🇰',
            'Sudan': '🇸🇩', 'Suriname': '🇸🇷', 'Sweden': '🇸🇪', 'Switzerland': '🇨🇭', 'Syria': '🇸🇾',
            'Tajikistan': '🇹🇯', 'Tanzania': '🇹🇿', 'Thailand': '🇹🇭', 'Togo': '🇹🇬', 'Tonga': '🇹🇴',
            'Trinidad and Tobago': '🇹🇹', 'Tunisia': '🇹🇳', 'Turkey': '🇹🇷', 'Turkmenistan': '🇹🇲', 'Tuvalu': '🇹🇻',
            'Uganda': '🇺🇬', 'Ukraine': '🇺🇦', 'United Arab Emirates': '🇦🇪', 'United Kingdom': '🇬🇧', 'United States': '🇺🇸',
            'Uruguay': '🇺🇾', 'Uzbekistan': '🇺🇿', 'Vanuatu': '🇻🇺', 'Vatican City': '🇻🇦', 'Venezuela': '🇻🇪',
            'Vietnam': '🇻🇳', 'Yemen': '🇾🇪', 'Zambia': '🇿🇲', 'Zimbabwe': '🇿🇼'
        };

        return countryFlags[countryName] || '';
    }

    createBasicFrame() {
        console.log('Creating basic frame fallback');
        // Créer un cadre de base si l'image ne se charge pas
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.isFrameLoaded = true;

        // Dessiner un cadre simple
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = '#dee2e6';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(90, 215, 320, 320);

        // Ajouter du texte pour identifier le cadre de base
        this.ctx.fillStyle = '#6c757d';
        this.ctx.font = '16px Inter, Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('TICAD9 Youth Initiatives', this.canvas.width / 2, 50);

        this.resizeCanvas();
        this.drawCanvas();
    }

    setupEventListeners() {
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.previewOverlay.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.shareBtn.addEventListener('click', () => this.shareImage());

        // Redessiner le canvas quand le texte change
        [this.firstNameInput, this.lastNameInput, document.getElementById('country')].forEach(input => {
            const eventType = input.tagName.toLowerCase() === 'select' ? 'change' : 'input';
            input.addEventListener(eventType, () => {
                console.log('Text input changed, redrawing canvas');
                this.drawCanvas();
            });
        });
    }

    setupMobileHelp() {
        const helpToggle = document.getElementById('helpToggle');
        const instructionsContent = document.getElementById('instructionsContent');

        if (helpToggle && instructionsContent) {
            helpToggle.addEventListener('click', () => {
                instructionsContent.classList.toggle('show');
                helpToggle.classList.toggle('active');
            });
        }
    }

    setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.canvasContainer.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.canvasContainer.addEventListener(eventName, () => {
                this.canvasContainer.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.canvasContainer.addEventListener(eventName, () => {
                this.canvasContainer.classList.remove('drag-over');
            }, false);
        });

        this.canvasContainer.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            console.log('File dropped:', files[0].name);
            this.handleFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            console.log('File selected:', file.name);
            this.handleFile(file);
        }
    }

    handleFile(file) {
        console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

        if (!file.type.startsWith('image/')) {
            console.error('Invalid file type:', file.type);
            alert('Please select a valid image file.');
            return;
        }

        // Afficher un indicateur de chargement
        this.uploadArea.innerHTML = '<div class="upload-icon">⏳</div><p>Loading image...</p>';

        const reader = new FileReader();

        reader.onload = (e) => {
            console.log('FileReader completed, creating new Image object');

            this.userImage = new Image();
            this.userImage.crossOrigin = 'anonymous';

            this.userImage.onload = () => {
                console.log('User image loaded successfully');
                console.log('User image dimensions:', this.userImage.naturalWidth, 'x', this.userImage.naturalHeight);

                // Double vérification que l'image est complètement chargée
                if (this.userImage.complete && this.userImage.naturalWidth > 0 && this.userImage.naturalHeight > 0) {
                    console.log('Image validation passed, updating UI');
                    this.previewOverlay.classList.add('hidden');
                    this.downloadBtn.disabled = false;
                    this.shareBtn.disabled = false;

                    // Redessiner le canvas
                    this.drawCanvas();
                } else {
                    console.error('Image validation failed');
                    console.log('Complete:', this.userImage.complete);
                    console.log('Natural width:', this.userImage.naturalWidth);
                    console.log('Natural height:', this.userImage.naturalHeight);
                    alert('Failed to load the image properly. Please try another file.');
                    this.resetUploadArea();
                }
            };

            this.userImage.onerror = (error) => {
                console.error('Failed to load user image:', error);
                alert('Failed to load the image. Please try another file.');
                this.resetUploadArea();
            };

            // Démarrer le chargement de l'image
            this.userImage.src = e.target.result;
        };

        reader.onerror = (error) => {
            console.error('FileReader error:', error);
            alert('Failed to read the file. Please try again.');
            this.resetUploadArea();
        };

        reader.readAsDataURL(file);
    }

    resetUploadArea() {
        this.uploadArea.innerHTML = `
            <div class="upload-icon">📷</div>
            <p>Click to add your photo</p>
            <p class="upload-hint">or drag and drop your image here</p>
        `;
        this.previewOverlay.classList.remove('hidden');
        this.downloadBtn.disabled = true;
        this.shareBtn.disabled = true;
    }

    drawCanvas() {
        console.log('=== DRAW CANVAS START ===');
        console.log('Frame loaded:', this.isFrameLoaded);
        console.log('User image exists:', !!this.userImage);
        console.log('User image complete:', this.userImage?.complete);
        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);

        if (!this.isFrameLoaded) {
            console.log('Frame not loaded, returning');
            return;
        }

        // Effacer complètement le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dessiner le fond/cadre
        this.drawFrame();

        // Dessiner l'image utilisateur si elle existe
        if (this.userImage) {
            this.drawUserImage();
        }

        // Ajouter le texte par-dessus
        this.drawText();

        console.log('=== DRAW CANVAS END ===');
    }

    drawFrame() {
        if (this.frameImage.complete && this.frameImage.naturalWidth > 0) {
            console.log('Drawing frame image');
            this.ctx.drawImage(this.frameImage, 0, 0);
        } else {
            console.log('Drawing basic frame background');
            // Fond de base si le frame n'est pas chargé
            this.ctx.fillStyle = '#f8f9fa';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Zone photo
            this.ctx.strokeStyle = '#dee2e6';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(90, 215, 320, 320);
        }
    }

    drawUserImage() {
        console.log('=== DRAWING USER IMAGE ===');

        // Vérifications strictes
        if (!this.userImage) {
            console.log('No user image to draw');
            return;
        }

        if (!this.userImage.complete) {
            console.log('User image not complete');
            return;
        }

        if (this.userImage.naturalWidth === 0 || this.userImage.naturalHeight === 0) {
            console.log('User image has invalid dimensions');
            return;
        }

        console.log('User image validation passed, proceeding to draw');
        console.log('Image natural dimensions:', this.userImage.naturalWidth, 'x', this.userImage.naturalHeight);

        // Coordonnées et dimensions de la zone photo dans le cadre TICAD9
        const photoArea = {
            x: 90,
            y: 215,
            width: 320,
            height: 320
        };

        console.log('Photo area:', photoArea);

        // Calculer les dimensions pour maintenir le ratio et remplir la zone
        const imgRatio = this.userImage.naturalWidth / this.userImage.naturalHeight;
        const areaRatio = photoArea.width / photoArea.height;

        console.log('Image ratio:', imgRatio, 'Area ratio:', areaRatio);

        let drawWidth, drawHeight, drawX, drawY;

        if (imgRatio > areaRatio) {
            // L'image est plus large que la zone - ajuster par la hauteur
            drawHeight = photoArea.height;
            drawWidth = drawHeight * imgRatio;
            drawX = photoArea.x - (drawWidth - photoArea.width) / 2;
            drawY = photoArea.y;
        } else {
            // L'image est plus haute que la zone - ajuster par la largeur
            drawWidth = photoArea.width;
            drawHeight = drawWidth / imgRatio;
            drawX = photoArea.x;
            drawY = photoArea.y - (drawHeight - photoArea.height) / 2;
        }

        console.log('Calculated draw dimensions:', {
            x: drawX,
            y: drawY,
            width: drawWidth,
            height: drawHeight
        });

        // Sauvegarder le contexte pour le clipping
        this.ctx.save();

        try {
            // Créer un chemin de clipping pour la zone photo
            this.ctx.beginPath();
            this.ctx.rect(photoArea.x, photoArea.y, photoArea.width, photoArea.height);
            this.ctx.clip();

            // Dessiner l'image utilisateur
            this.ctx.drawImage(
                this.userImage,
                drawX,
                drawY,
                drawWidth,
                drawHeight
            );

            console.log('User image drawn successfully');

        } catch (error) {
            console.error('Error drawing user image:', error);
        } finally {
            // Restaurer le contexte
            this.ctx.restore();
        }
    }

    drawText() {
        console.log('=== DRAWING TEXT ===');

        const firstName = this.firstNameInput.value.trim();
        const lastName = this.lastNameInput.value.trim();
        const countrySelect = document.getElementById('country');
        const country = countrySelect.options[countrySelect.selectedIndex].text;
        const countryCode = countrySelect.value;

        console.log('Text values:', { firstName, lastName, country, countryCode });

        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        const textArea = {
            x: 105,
            y: 555,
            width: 290,
            lineHeight: 25
        };

        // Nom complet en ORANGE
        if (firstName || lastName) {
            this.ctx.fillStyle = '#be8e25'; // Orange vif
            this.ctx.font = 'bold 20px Inter, Arial, sans-serif';
            const fullName = `${firstName} ${lastName}`.trim().toUpperCase();
            this.ctx.fillText(fullName, textArea.x, textArea.y);
        }

        // Pays avec drapeau et code en NOIR
        if (country && country !== 'Select your country') {
            console.log('Drawing country:', country, 'with code:', countryCode);
            const countryY = textArea.y + (firstName || lastName ? textArea.lineHeight : 0);
            const flagEmoji = this.getCountryFlag(country);

            this.ctx.fillStyle = '#000000';
            this.ctx.font = '18px Inter, Arial, sans-serif';

            if (flagEmoji) {
                // Afficher le drapeau, le nom du pays et le code
                this.ctx.font = '20px Inter, Arial, sans-serif'; // Taille pour l'emoji
                this.ctx.fillText(flagEmoji, textArea.x, countryY);
                this.ctx.font = '18px Inter, Arial, sans-serif'; // Taille pour le texte
                this.ctx.fillText(` ${country.toUpperCase()}`, textArea.x + 25, countryY);
            } else {
                // Afficher le nom du pays et le code si pas de drapeau
                // this.ctx.fillText(`${country.toUpperCase()} (${countryCode})`, textArea.x, countryY);
                this.ctx.fillText(`${country.toUpperCase()}`, textArea.x, countryY);
            }
        } else {
            console.log('No country selected or invalid country');
        }

        console.log('=== TEXT DRAWING COMPLETE ===');
    }


    downloadImage() {
        console.log('Downloading image');
        try {
            const link = document.createElement('a');
            link.download = `TICAD9-Youth-${Date.now()}.png`;
            link.href = this.canvas.toDataURL('image/png', 1.0);
            link.click();
            console.log('Download initiated');
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download image. Please try again.');
        }
    }

    shareImage() {
        console.log('Sharing image');

        if (navigator.share && navigator.canShare) {
            // API Web Share native (mobile)
            this.canvas.toBlob((blob) => {
                const file = new File([blob], 'ticad9-youth-photo.png', { type: 'image/png' });

                if (navigator.canShare({ files: [file] })) {
                    navigator.share({
                        title: 'TICAD9 Youth Initiatives',
                        text: 'I am attending TICAD9 Youth Initiatives! #YOUTHTICAD2025 #TICAD9 #AFRICAJAPAN #COCREATION #THEFUTUREWEWANT',
                        files: [file]
                    }).then(() => {
                        console.log('Share successful');
                    }).catch((error) => {
                        console.error('Share failed:', error);
                        this.fallbackShare();
                    });
                } else {
                    console.log('File sharing not supported, trying text share');
                    navigator.share({
                        title: 'TICAD9 Youth Initiatives',
                        text: 'I am attending TICAD9 Youth Initiatives! #YOUTHTICAD2025 #TICAD9 #AFRICAJAPAN #COCREATION #THEFUTUREWEWANT',
                        url: window.location.href
                    }).catch(() => this.fallbackShare());
                }
            }, 'image/png', 1.0);
        } else {
            this.fallbackShare();
        }
    }

    fallbackShare() {
        console.log('Using fallback share method');

        // Fallback : copier l'image dans le presse-papiers
        if (navigator.clipboard && navigator.clipboard.write) {
            this.canvas.toBlob((blob) => {
                const item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item]).then(() => {
                    console.log('Image copied to clipboard');
                    alert('Image copied to clipboard! You can now paste it on social media.');
                }).catch((error) => {
                    console.error('Clipboard write failed:', error);
                    // Fallback ultime : télécharger l'image
                    this.downloadImage();
                    alert('Image downloaded! You can now share it on social media.');
                });
            }, 'image/png', 1.0);
        } else {
            // Fallback ultime : télécharger l'image
            this.downloadImage();
            alert('Image downloaded! You can now share it on social media.');
        }
    }

    // Méthode pour redimensionner le canvas de manière responsive
    resizeCanvas() {
        if (!this.isFrameLoaded) return;

        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 6; // Soustraire les bordures
        const originalWidth = this.frameImage.naturalWidth || this.canvas.width;
        const originalHeight = this.frameImage.naturalHeight || this.canvas.height;
        const scale = containerWidth / originalWidth;

        console.log('Resizing canvas - Container width:', containerWidth, 'Scale:', scale);

        if (scale < 1) {
            this.canvas.style.width = containerWidth + 'px';
            this.canvas.style.height = (originalHeight * scale) + 'px';
        } else {
            this.canvas.style.width = originalWidth + 'px';
            this.canvas.style.height = originalHeight + 'px';
        }
    }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing PhotoCallApp');

    const app = new PhotoCallApp();

    // Redimensionner le canvas lors du redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        console.log('Window resized');
        if (app.isFrameLoaded) {
            app.resizeCanvas();
        }
    });

    // Redimensionner le canvas une fois le cadre chargé
    app.frameImage.addEventListener('load', () => {
        console.log('Frame loaded, resizing canvas');
        app.resizeCanvas();
    });
});

// Ajouter des animations de chargement pour les boutons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            if (!this.disabled) {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 1000);
            }
        });
    });
});