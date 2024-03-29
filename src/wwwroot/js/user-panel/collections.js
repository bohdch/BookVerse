const userId = document.getElementById('userId').value;
const collectionSelectElement = document.getElementById('collection-select');
const letterFilters = document.querySelectorAll('.letter-filter');

// Initialize collection select element
collectionSelectElement.innerHTML = '<option value="">Select a Collection</option>';

async function loadCollectionsAndBooks() {
    const response = await fetch(`/api/collections/?userId=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();

    const collectionSelectElement = document.getElementById('collection-select');
    collectionSelectElement.innerHTML = '<option value="">Select a Collection</option>';

    data.forEach(collection => {
        const option = document.createElement('option');
        option.value = collection.id;
        option.textContent = collection.title;
        collectionSelectElement.appendChild(option);
    });

    // Attach an event listener to the select element
    collectionSelectElement.addEventListener('change', async (event) => {
        const selectedCollectionId = event.target.value;
        await fetchBooksFromCollection(selectedCollectionId);
    });
}

async function fetchBooksFromCollection(collectionId) {
    clearBooksAndLetterFilters();

    const response = await fetch(`/api/collection/books/?collectionId=${collectionId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        const books = await response.json();
        const lettersWithBooks = new Set(books.map(book => book.title[0].toUpperCase()));

        updateLetterFilters(lettersWithBooks);

        books.forEach(book => {
            const bookElement = createBookElement(book);
            const firstLetter = book.title[0];

            const letterFilter = document.querySelector(`.letter-filter[letter="${firstLetter}"]`);
            const booksListElement = letterFilter.nextElementSibling;
            booksListElement.appendChild(bookElement);
        });
    } else {
        console.error('Failed to fetch books from the collection.');
    }
}

function createBookElement(bookData) {
    const bookItem = document.createElement('li');
    bookItem.className = 'book';

    // Adding the data-book-id attribute
    bookItem.setAttribute('data-book-id', bookData.id); 

    const bookImage = document.createElement('img');
    bookImage.src = bookData.formats['image/jpeg'];
    bookImage.alt = 'Audio Book';

    const bookTitle = document.createElement('h3');
    bookTitle.textContent = bookData.title;

    const bookAuthor = document.createElement('p');
    const authors = bookData.authors && bookData.authors.length > 0 ? bookData.authors.map(author => author.name).join('; ') : 'Unknown';
    bookAuthor.textContent = authors;

    bookItem.append(bookImage, bookTitle, bookAuthor);

    bookItem.addEventListener('click', () => redirectToBookDetails(bookData, authors));

    return bookItem;
}

async function deleteBook() {
    const bookId = document.getElementById('book-id').textContent;
    const collectionSelectElement = document.getElementById('collection-select').value;

    const confirmDelete = confirm("Are you sure you want to delete this book from the collection?");

    if (!confirmDelete) {
        return;
    }

    const queryString = `/?bookId=${bookId}&collectionId=${collectionSelectElement}`;

    const response = await fetch(`/api/collection/delete-book${queryString}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    })

    if (!response.ok) {
        throw new Error("Failed to delete book from the Collection.");
    }

    // Remove the book element from the UI list
    const bookElement = document.querySelector(`.book[data-book-id="${bookId}"]`);
    bookElement.innerHTML = "";

    showNotification("Book removed from this collection!", 3000);
    closeBookDetails();
}

// Clear books and letter filters
function clearBooksAndLetterFilters() {
    letterFilters.forEach(letterFilter => {
        const booksListElement = letterFilter.nextElementSibling;
        booksListElement.innerHTML = '';
        letterFilter.style.display = 'none';
    });
}

// Update letter filters based on available books
function updateLetterFilters(lettersWithBooks) {
    letterFilters.forEach(letterFilter => {
        const letter = letterFilter.getAttribute('letter');
        letterFilter.style.display = lettersWithBooks.has(letter) ? 'block' : 'none';
    });
}

function showNotification(message, duration) {
    const notification = document.getElementById('notification');
    notification.textContent = message;

    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, duration);
}

// Call the loadCollectionsAndBooks function when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadCollectionsAndBooks();
});
