const baseUrl = 'https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json';
let heroData = [];
let currentPage = 1;
let pageSize = 20;
let currentSortColumn = 'name';
let currentSortOrder = 'asc';
let currentSearchTerm = '';
let currentSearchField = 'name';

const loadData = (heroes) => {
  heroData = heroes;
  renderTable();
  renderPagination();
};

const fetchData = () => {
  fetch(baseUrl)
    .then((response) => response.json())
    .then(loadData)
    .catch((error) => {
      console.error('Error:', error);
    });
};

const renderTable = () => {
  const tableBody = document.getElementById('hero-data');
  tableBody.innerHTML = '';

  const sortedData = sortData(heroData, currentSortColumn, currentSortOrder);
  const filteredData = searchHeroes(sortedData, currentSearchTerm, currentSearchField);
  const paginatedData = paginateData(filteredData, currentPage, pageSize);

  paginatedData.forEach((hero) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${hero.images.xs}" alt="${hero.name}"></td>
      <td>${hero.name}</td>
      <td>${hero.biography.fullName}</td>
      <td>${hero.powerstats.intelligence}</td>
      <td>${hero.powerstats.strength}</td>
      <td>${hero.powerstats.speed}</td>
      <td>${hero.powerstats.durability}</td>
      <td>${hero.powerstats.power}</td>
      <td>${hero.powerstats.combat}</td>

      <td>${hero.appearance.race}</td>
      <td>${hero.appearance.gender}</td>
      <td>${hero.appearance.height}</td>
      <td>${hero.appearance.weight}</td>
      <td>${hero.biography.placeOfBirth}</td>
      <td>${hero.biography.alignment}</td>
    `;
    tableBody.appendChild(row);
  });


};



const renderPagination = () => {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / pageSize);
  // console.log(pageSize);



  if (isNaN(pageSize)) { // Check if "all" option is selected
    // console.log("OK2")
    pageSize = filteredData.length
    currentPage = 1;
    renderTable();
  } else {
    for (let i = 1; i <= totalPages; i++) {
      const link = document.createElement('a');
      link.href = '#';
      link.innerText = i;
      if (i === currentPage) {
        link.classList.add('active');
      }
      link.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = i;
        renderTable();
        renderPagination();
      });
      paginationContainer.appendChild(link);
    }
  }
};

const sortData = (data, column, order) => {
  // const regex = /\btons$/;
  // const regex2 = /\bmeters$/;
  const sortedData = [...data];
  sortedData.sort((a, b) => {
    const aValue = getDataValue(a, column);
    const bValue = getDataValue(b, column);
    // var reg1 = new
    if (aValue === null || bValue === null) {
      return aValue === null ? 1 : -1;
    }

    if (column === 'appearance.height' || column === 'appearance.weight') {

      // aValue = ['200000000 lb', '90,000 tons' ]
      let aNumericValue = parseFloat(aValue[1].split(' ')[0].replace((/[,]/g), ""));
      let bNumericValue = parseFloat(bValue[1].split(' ')[0].replace((/[,]/g), ""));

      if (aValue[1].split(' ')[1] === "tons"){
        aNumericValue *= 1000
      }else if (bValue[1].split(' ')[1] === "tons"){
        bNumericValue *= 1000
      }
      if (aValue[1].split(' ')[1] === "meters") {
        aNumericValue *= 100
        // console.log(aNumericValue + 'we')
      } else if (bValue[1].split(' ')[1] === "meters") {
        bNumericValue *= 100
        // console.log(bNumericValue + "qwerty")
      }

      if (isNaN(aNumericValue) || isNaN(bNumericValue)) {

        return 0;
      }
      return aNumericValue - bNumericValue;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue);
    } else {
      return aValue - bValue;
    }
  });

  if (order === 'desc') {
    sortedData.reverse();
  }
  
  // Move empty string, null, and '-' values to the end
  sortedData.sort((a, b) => {
    const aValue = getDataValue(a, column);
    const bValue = getDataValue(b, column);

    if (aValue === '' || aValue === null || aValue === '-' || aValue[0] === ('(')) {
      return 1;
    } else if (bValue === '' || bValue === null || bValue === '-' || bValue[0] === ('(')) {
      return -1;
    } else {
      return 0;
    }
  });
  return sortedData;
};

const getDataValue = (data, column) => {
  const keys = column.split('.');
  // console.log(keys)
  let value = data;
//  console.log(value,"OK")
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      break;
    }
  }

  return value;
};

const searchHeroes = (data, term, field) => {
  // console.log(data);
  if (!term) {
    return data;
  }

  const filteredData = data.filter((hero) => {
    const value = getDataValue(hero, field);
    return value !== null && String(value).toLowerCase().includes(term.toLowerCase());
  });

  return filteredData;
};

const paginateData = (data, page, size) => {
  const start = (page - 1) * size;
  const end = start + size;
  return data.slice(start, end);
};

const getFilteredData = () => {
  const sortedData = sortData(heroData, currentSortColumn, currentSortOrder);
  return searchHeroes(sortedData, currentSearchTerm, currentSearchField);
};

const applySearchParamsFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  const size = urlParams.get('size');
  const sortColumn = urlParams.get('sortColumn');
  const sortOrder = urlParams.get('sortOrder');
  const searchTerm = urlParams.get('searchTerm');


  currentPage = page ? parseInt(page) : currentPage;
  pageSize = size ? parseInt(size) : pageSize;
  currentSortColumn = sortColumn ? sortColumn : currentSortColumn;
  currentSortOrder = sortOrder ? sortOrder : currentSortOrder;
  currentSearchTerm = searchTerm ? searchTerm : currentSearchTerm;


  const pageSizeSelect = document.getElementById('page-size');
  const sortColumnButtons = document.querySelectorAll('.sort-controls .sort-column button');
  const searchInput = document.getElementById('search');


  pageSizeSelect.value = pageSize;
  sortColumnButtons.forEach((button) => {
    const column = button.getAttribute('data-column');
    if (column === currentSortColumn) {
      button.classList.add(currentSortOrder === 'asc' ? 'asc' : 'desc');
      button.classList.remove(currentSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      button.classList.remove('asc', 'desc');
    }
  });
  searchInput.value = currentSearchTerm;

};

const updateUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set('page', currentPage);
  urlParams.set('size', pageSize);
  urlParams.set('sortColumn', currentSortColumn);
  urlParams.set('sortOrder', currentSortOrder);
  urlParams.set('searchTerm', currentSearchTerm);


  const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
  window.history.replaceState({}, '', newUrl);
};

document.addEventListener('DOMContentLoaded', () => {
  const pageSizeSelect = document.getElementById('page-size');
  const sortColumnButtons = document.querySelectorAll('.sort-controls .sort-column button');
  const searchInput = document.getElementById('search');


  pageSizeSelect.addEventListener('change', () => {
    pageSize = parseInt(pageSizeSelect.value);
    currentPage = 1;
    renderTable();
    renderPagination();
    updateUrlParams();
  });



  sortColumnButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const column = button.getAttribute('data-column');
      if (currentSortColumn === column) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        currentSortColumn = column;
        currentSortOrder = 'asc';
      }
      currentPage = 1;
      renderTable();
      renderPagination();
      updateUrlParams();
    });
  });

  searchInput.addEventListener('input', () => {
    currentSearchTerm = searchInput.value;
    currentPage = 1;
    renderTable();
    renderPagination();
    updateUrlParams();
  });


  applySearchParamsFromUrl();
  fetchData();
});
