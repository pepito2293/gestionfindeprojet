// Liste des émojis par défaut
const defaultEmojis = [
  "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
  "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
  "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
  "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
  "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
  "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
];

// Fonction pour charger les émojis personnalisés depuis `localStorage`
function loadEmojiList() {
  const storedEmojis = localStorage.getItem("emojiList");
  return storedEmojis ? JSON.parse(storedEmojis) : [...defaultEmojis];
}

// Fonction pour sauvegarder les émojis dans `localStorage`
function saveEmojiList() {
  localStorage.setItem("emojiList", JSON.stringify(emojiList));
}

// Initialisation de la liste d'émojis (personnalisée ou par défaut)
let emojiList = loadEmojiList();

// Fonction pour générer les cartes Dobble
function generateDobbleCards() {
  const n = 7; // Nombre de symboles par carte - 1
  const totalSymbols = n * n + n + 1;
  const symbols = emojiList.slice(0, totalSymbols);
  const cards = [];

  for (let i = 0; i <= n; i++) {
    const card = [symbols[0]];
    for (let j = 0; j < n; j++) {
      card.push(symbols[1 + i * n + j]);
    }
    cards.push(card);
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const card = [symbols[1 + i]];
      for (let k = 0; k < n; k++) {
        const index = 1 + n + k * n + ((i * k + j) % n);
        card.push(symbols[index]);
      }
      cards.push(card);
    }
  }

  return cards.slice(0, 55);
}

// Fonction pour afficher les cartes dans la grille
function generateCards() {
  const cardContainer = document.getElementById("cardContainer");
  cardContainer.innerHTML = "";

  const cards = generateDobbleCards();
  cards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    positionSymbols(cardDiv, card);
    cardContainer.appendChild(cardDiv);
  });
}

// Fonction pour positionner les symboles sur une carte
function positionSymbols(cardDiv, card) {
  const cardSize = 250;
  const margin = 20;

  // Récupère les valeurs des curseurs pour les tailles minimale et maximale
  const minSize = parseInt(document.getElementById("minSize").value, 10) || 30;
  const maxSize = parseInt(document.getElementById("maxSize").value, 10) || 70;

  const positions = [];

  card.forEach((symbol) => {
    let isValidPosition = false;
    let x, y, size;

    while (!isValidPosition) {
      size = Math.random() * (maxSize - minSize) + minSize; // Taille aléatoire
      x = margin + Math.random() * (cardSize - 2 * margin - size);
      y = margin + Math.random() * (cardSize - 2 * margin - size);

      // Vérifie que les émojis ne se chevauchent pas
      isValidPosition = positions.every(pos => {
        const distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
        return distance > (pos.size + size) / 2 + 10;
      });
    }

    positions.push({ x, y, size });

    const rotation = Math.random() * 360; // Rotation aléatoire entre 0 et 360 degrés
    const symbolDiv = document.createElement("div");
    symbolDiv.className = "symbol";

    if (symbol.startsWith("data:image")) {
      const img = document.createElement("img");
      img.src = symbol;
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      symbolDiv.appendChild(img);
    } else {
      symbolDiv.textContent = symbol;
      symbolDiv.style.fontSize = `${size}px`;
    }

    // Applique les styles, y compris la rotation
    Object.assign(symbolDiv.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      transform: `rotate(${rotation}deg)`, // Applique la rotation
      transformOrigin: "center", // Centre la rotation
    });

    enableDrag(symbolDiv); // Active le déplacement pour chaque émoji
    cardDiv.appendChild(symbolDiv);
  });
}

// Fonction pour activer le déplacement des émojis
function enableDrag(symbol) {
  let isDragging = false; // Indique si le symbole est en cours de déplacement
  let offsetX, offsetY;

  // Empêche le comportement par défaut de drag & drop
  symbol.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  // Début du déplacement
  symbol.addEventListener("mousedown", (event) => {
    isDragging = true;
    offsetX = event.clientX - symbol.offsetLeft;
    offsetY = event.clientY - symbol.offsetTop;
    symbol.style.cursor = "grabbing"; // Change le curseur pendant le déplacement
  });

  // Déplacement de l'émoji
  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const parentRect = symbol.parentElement.getBoundingClientRect();
      let newLeft = event.clientX - offsetX;
      let newTop = event.clientY - offsetY;

      // Empêche le symbole de sortir de la carte
      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;
      if (newLeft + symbol.offsetWidth > parentRect.width) {
        newLeft = parentRect.width - symbol.offsetWidth;
      }
      if (newTop + symbol.offsetHeight > parentRect.height) {
        newTop = parentRect.height - symbol.offsetHeight;
      }

      symbol.style.left = `${newLeft}px`;
      symbol.style.top = `${newTop}px`;
    }
  });

  // Fin du déplacement
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      symbol.style.cursor = "move"; // Retourne au curseur par défaut
    }
  });
}

// DOs des cartes
let backCardImage = null; // Stocke l'image du dos des cartes

document.getElementById("backCardUpload").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            backCardImage = e.target.result; // Stocke l'image en base64
            localStorage.setItem("backCardImage", backCardImage); // Sauvegarde dans le localStorage
            document.getElementById("backCardPreview").src = backCardImage;
            document.getElementById("backCardPreview").style.display = "block";
        };
        reader.readAsDataURL(file);
    }
});
// Fonction pour télécharger les cartes en PDF
async function downloadCardsAsPDF() {
    try {
        console.log("📥 Début de la génération du PDF...");

        // 🔄 Charger l'image du dos des cartes
        backCardImage = localStorage.getItem("backCardImage") || null;
        console.log("🖼 Image du dos chargée :", backCardImage);

        // Vérification des cartes
        const cardContainer = document.getElementById("cardContainer");
        const cards = cardContainer.querySelectorAll(".card");

        if (cards.length === 0) {
            alert("❌ Aucune carte à télécharger. Veuillez d'abord générer les cartes.");
            return;
        }

        if (!backCardImage) {
            alert("❌ Veuillez ajouter une image pour le dos des cartes.");
            return;
        }

        console.log("✅ Toutes les vérifications sont OK !");

        // 📄 Initialisation du PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("portrait", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // 📏 Configuration des cartes sur le PDF
        const cardSize = 85.53; // Taille standard pour aligner les cartes
        const spaceBetween = 5;
        const maxCardsPerRow = 2;
        const maxCardsPerCol = 3;
        const totalCardsPerPage = maxCardsPerRow * maxCardsPerCol;

        const totalWidth = maxCardsPerRow * cardSize + (maxCardsPerRow - 1) * spaceBetween;
        const totalHeight = maxCardsPerCol * cardSize + (maxCardsPerCol - 1) * spaceBetween;

        const startX = (pageWidth - totalWidth) / 2;
        const startY = (pageHeight - totalHeight) / 2;

        let currentCardIndex = 0;
        let pages = [];

        // 📸 Capture des cartes recto
        console.log("📸 Capture des cartes...");
        for (let i = 0; i < cards.length; i++) {
            console.log(`📷 Capture de la carte ${i + 1}...`);
            const canvas = await html2canvas(cards[i], { scale: 2 });
            const imgData = canvas.toDataURL("image/png");

            const row = Math.floor(currentCardIndex / maxCardsPerRow) % maxCardsPerCol;
            const col = currentCardIndex % maxCardsPerRow;
            const x = startX + col * (cardSize + spaceBetween);
            const y = startY + row * (cardSize + spaceBetween);

            if (!pages[Math.floor(currentCardIndex / totalCardsPerPage)]) {
                pages[Math.floor(currentCardIndex / totalCardsPerPage)] = [];
            }

            pages[Math.floor(currentCardIndex / totalCardsPerPage)].push({ imgData, x, y });

            currentCardIndex++;
        }

        console.log("✅ Toutes les cartes ont été capturées !");

        // 📄 Génération des pages du PDF avec recto-verso aligné
        pages.forEach((page, pageIndex) => {
            console.log(`🖨️ Ajout de la page ${pageIndex + 1} (recto)...`);
            if (pageIndex > 0) pdf.addPage(); // Nouvelle page uniquement après la première

            // Ajout des cartes (recto)
            page.forEach(({ imgData, x, y }) => {
                pdf.addImage(imgData, "PNG", x, y, cardSize, cardSize);
            });

            // Ajout du verso aligné
            console.log(`🔄 Ajout du verso des cartes sur la page ${pageIndex + 2}...`);
            pdf.addPage();

            page.forEach(({ x, y }) => {
                // 🛠️ Correction : le verso est maintenant parfaitement aligné avec le recto
                pdf.addImage(backCardImage, "PNG", x, y, cardSize, cardSize);
            });
        });

        // 📥 Téléchargement du PDF
        pdf.save("dobble_cards.pdf");
        alert("✅ Le PDF avec recto-verso a été généré avec succès !");
    } catch (error) {
        console.error("❌ Erreur lors du téléchargement du PDF :", error);
        alert("Une erreur est survenue lors du téléchargement du PDF.");
    }
}


// Fonction pour remplir le tableau des émojis personnalisables
function populateEmojiTable() {
    const tableBody = document.getElementById("emojiTable").querySelector("tbody");
    tableBody.innerHTML = "";

    emojiList.forEach((emoji, index) => {
        const row = document.createElement("tr");

        const numberCell = document.createElement("td");
        numberCell.textContent = index + 1;
        row.appendChild(numberCell);

        const emojiCell = document.createElement("td");
        if (emoji.startsWith("data:image")) {
            emojiCell.innerHTML = `<img src="${emoji}" width="20" height="20">`;
        } else {
            emojiCell.textContent = emoji;
        }
        emojiCell.id = `current-emoji-${index}`;
        row.appendChild(emojiCell);

        const inputCell = document.createElement("td");
        const uploadButton = document.createElement("label");
        uploadButton.className = "bouton-style"; // Apply the button style
        uploadButton.textContent = "Choisir un fichier";

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.dataset.index = index;
        fileInput.style.display = "none"; // Hide the input element

        uploadButton.appendChild(fileInput);
        inputCell.appendChild(uploadButton);

        uploadButton.addEventListener("click", (event) => {
    event.preventDefault(); // Évite un comportement inattendu
    fileInput.click();
}, { once: true }); // S'assure que l'événement ne se déclenche qu'une seule fois


  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            emojiList[index] = e.target.result;
            saveEmojiList();
            populateEmojiTable();  // Mise à jour immédiate de l'affichage
            generateCards();        // Re-générer les cartes pour inclure le nouvel emoji
        };
        reader.readAsDataURL(file);
    }
}, { once: true }); // Empêche la boîte de dialogue de s'ouvrir deux fois

        row.appendChild(inputCell);

        const actionCell = document.createElement("td");
        const resetButton = document.createElement("button");
        resetButton.textContent = "Réinitialiser";
        resetButton.onclick = () => resetEmoji(index);
        actionCell.appendChild(resetButton);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}


// Fonction pour réinitialiser un émoji
function resetEmoji(index) {
  emojiList[index] = defaultEmojis[index];
  saveEmojiList();
  populateEmojiTable();
  generateCards();
}

// Fonction pour mettre à jour l'affichage des curseurs
function updatePreview() {
  const minSizeInput = document.getElementById("minSize");
  const maxSizeInput = document.getElementById("maxSize");
  document.getElementById("minSizeValue").textContent = `${minSizeInput.value}px`;
  document.getElementById("maxSizeValue").textContent = `${maxSizeInput.value}px`;

  if (parseInt(minSizeInput.value, 10) > parseInt(maxSizeInput.value, 10)) {
    maxSizeInput.value = minSizeInput.value;
    document.getElementById("maxSizeValue").textContent = `${maxSizeInput.value}px`;
  }
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  populateEmojiTable();
  generateCards();

  document.getElementById("minSize").addEventListener("input", () => {
    updatePreview();
    generateCards();
  });

  document.getElementById("maxSize").addEventListener("input", () => {
    updatePreview();
    generateCards();
  });
});

async function exportCardsAsZip() {
  const cardContainer = document.getElementById("cardContainer");
  const cards = cardContainer.querySelectorAll(".card");

  if (cards.length === 0) {
    alert("Aucune carte à exporter. Veuillez d'abord générer les cartes.");
    return;
  }

  const zip = new JSZip(); // Initialisation du fichier ZIP
  const folder = zip.folder("Cartes_Dobble"); // Création d'un dossier dans le ZIP

  for (let i = 0; i < cards.length; i++) {
    const canvas = await html2canvas(cards[i], { scale: 2 }); // Capture la carte en tant que canvas
    const imgData = canvas.toDataURL("image/png"); // Convertit en PNG

    // Ajoute l'image au dossier ZIP
    folder.file(`carte_dobble_${i + 1}.png`, imgData.split(",")[1], { base64: true });
  }

  // Génère le fichier ZIP
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, "cartes_dobble.zip"); // Télécharge le fichier ZIP
    alert("Les 55 cartes ont été téléchargées en tant que fichier ZIP !");
  });
}

// Plugin tout réinitialiser
document.getElementById("resetAll").addEventListener("click", () => {
    if (confirm("Voulez-vous vraiment réinitialiser tous les émojis ?")) {
        emojiList = [...defaultEmojis]; // Remet tous les émojis par défaut
        saveEmojiList();  // Sauvegarde la nouvelle liste dans localStorage
        populateEmojiTable();  // Met à jour le tableau
        generateCards();  // Re-génère les cartes Dobble
    }
});




// Charger l'image du dos de carte au démarrage si elle est stockée
window.addEventListener("load", () => {
    if (localStorage.getItem("backCardImage")) {
        backCardImage = localStorage.getItem("backCardImage");
        document.getElementById("backCardPreview").src = backCardImage;
        document.getElementById("backCardPreview").style.display = "block";
    }
});


//Ajout d'un coup:
document.getElementById("multiFileUpload").addEventListener("change", async (event) => {
    const files = event.target.files;

    if (files.length === 0) {
        alert("❌ Aucun fichier sélectionné !");
        return;
    }

    if (files.length > 57) {
        alert("⚠️ Vous ne pouvez pas importer plus de 57 images.");
        return;
    }

    console.log(`📥 Importation de ${files.length} images...`);

    let newEmojiList = [...emojiList]; // Copie la liste actuelle
    let loadedImages = 0;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = ((index) => (e) => {
            newEmojiList[index] = e.target.result; // Remplace l'émoji existant par l'image importée
            loadedImages++;

            // Vérifie si toutes les images sont chargées
            if (loadedImages === files.length) {
                emojiList = newEmojiList; // Met à jour la liste globale
                saveEmojiList();
                populateEmojiTable();
                generateCards();
                alert(`✅ ${files.length} image(s) ont été importées avec succès !`);
            }
        })(i);

        reader.readAsDataURL(file);
    }
});


        reader.readAsDataURL(file);
    }
});
