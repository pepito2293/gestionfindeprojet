// Liste des émojis par défaut
const defaultEmojis = [
  "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
  "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
  "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
  "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
  "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
  "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
];

// Chargement et sauvegarde des émojis personnalisés
function loadEmojiList() {
  const storedEmojis = localStorage.getItem("emojiList");
  return storedEmojis ? JSON.parse(storedEmojis) : [...defaultEmojis];
}

function saveEmojiList() {
  localStorage.setItem("emojiList", JSON.stringify(emojiList));
}

// Initialisation de la liste d'émojis
let emojiList = loadEmojiList();

// Fonction pour générer les cartes Dobble
function generateDobbleCards() {
  const n = 7;
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

// Fonction pour générer le PDF avec recto-verso
async function downloadCardsAsPDF() {
  try {
    const cardContainer = document.getElementById("cardContainer");
    const cards = cardContainer.querySelectorAll(".card");

    if (cards.length === 0) {
      alert("Aucune carte à télécharger. Veuillez d'abord générer les cartes.");
      return;
    }

    if (!backCardImage) {
      alert("Veuillez ajouter une image pour le dos des cartes.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("portrait", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const cardSize = 85.53;
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

    for (let i = 0; i < cards.length; i++) {
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

    pages.forEach((page, pageIndex) => {
      if (pageIndex > 0) pdf.addPage();
      page.forEach(({ imgData, x, y }) => {
        pdf.addImage(imgData, "PNG", x, y, cardSize, cardSize);
      });

      pdf.addPage();
      page.forEach(({ x, y }) => {
        pdf.addImage(backCardImage, "PNG", x, y, cardSize, cardSize);
      });
    });

    pdf.save("dobble_cards.pdf");
    alert("Le PDF avec recto-verso a été généré !");
  } catch (error) {
    console.error("Erreur lors du téléchargement du PDF :", error);
    alert("Une erreur est survenue lors du téléchargement du PDF.");
  }
}

// Plugin tout réinitialiser
document.getElementById("resetAll").addEventListener("click", () => {
  if (confirm("Voulez-vous vraiment réinitialiser tous les émojis ?")) {
    emojiList = [...defaultEmojis];
    saveEmojiList();
    populateEmojiTable();
    generateCards();
  }
});

let backCardImage = null;

document.getElementById("backCardUpload").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      backCardImage = e.target.result;
      localStorage.setItem("backCardImage", backCardImage);
    };
    reader.readAsDataURL(file);
  }
});

// Charger l'image du dos de carte si elle est stockée
window.addEventListener("load", () => {
  if (localStorage.getItem("backCardImage")) {
    backCardImage = localStorage.getItem("backCardImage");
  }
});
