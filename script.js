// SideBar DOM Selectors
const dashboardBtn = document.querySelector("#dashboardlnk");
const settingsBtn = document.querySelector("#settingslnk");
const addTxBtn = document.querySelector("aside .bottom button");
const dashboardSection = document.querySelector("#dashboard-section");
const settingsSection = document.querySelector("#settings-section");
// Navbar DOM Selectors
const navUserName = document.querySelector(".navBar #navBar-user");
const logoutBtn = document.querySelector(".navBar button");
// Overview Cards DOM Selectors
const totalTransactions = document.querySelector("#total-transactions");
const ovBalance = document.querySelector("#crnt-balance");
const ovIncome = document.querySelector("#total-income");
const ovExpense = document.querySelector("#total-expnse");
// Transaction Overlay DOM Selectors
const txOverlay = document.querySelector("#transactionOverlay");
const txOverlayClose = document.querySelector(
  "#transactionOverlay .overlay-header span",
);
const txForm = document.querySelector("#transactionOverlay form");
const txOverlayHeader = document.querySelector(
  "#transactionOverlay .overlay-header h3",
);
// Graph DOM Selectors
const chartCanvas = document.querySelector("#cashFlowChart");
// Table DOM Selectors
const tableBody = document.querySelector(".table-card table tbody");
const searchInput = document.querySelector("#search-Input");
const filterInput = document.querySelector("#type-filter");
// Dashboard grid DOM Selectors
const resetBtn = document.querySelector(".side-column button");
// Settings Section DOM Selectors
const settingsForm = document.querySelector("#settingsForm");
const settingsName = document.querySelector("#settingName");
const settingsCurrency = document.querySelector("#settingCurrency");
// Theme toggle
const themeToggle = document.querySelector("#theme");

// Global Variables
let currentUser = localStorage.getItem("currentUser");
let txArray =
  JSON.parse(localStorage.getItem(`Transactions_${currentUser}`)) || [];
let updateIndex = null;
let cashFlowChart;

// Getting Current User Theme From LS
const savedTheme = localStorage.getItem(`theme_${currentUser}`);
if (savedTheme === "dark") {
  document.body.classList.add("dark-theme");
  themeToggle.checked = true;
}

// Getting Current User Settings from LS
const userSettings = JSON.parse(
  localStorage.getItem(`Settings_${currentUser}`),
) || {
  name: currentUser,
  currency: "$",
};

settingsName.value = userSettings.name;
settingsCurrency.value = userSettings.currency;

// Overview Cards
let overview = (data = txArray) => {
  let totalIncome = 0;
  let totalExpense = 0;

  data.forEach((elem, index) => {
    if (elem.type === "income") {
      totalIncome += Number(elem.amount);
    } else if (elem.type === "expense") {
      totalExpense += Number(elem.amount);
    }
  });

  const balance = totalIncome - totalExpense;
  const currency = userSettings?.currency || "$"; // If user settings existes --> get currency, else set currency to "$"
  ovBalance.textContent = `${currency}${balance.toFixed(2)}`;
  ovIncome.textContent = `${currency}${totalIncome.toFixed(2)}`;
  ovExpense.textContent = `${currency}${totalExpense.toFixed(2)}`;

  updateChart(totalIncome, totalExpense);
};

// GRAPH
let updateChart = (income, expense) => {
  const styles = getComputedStyle(document.body);

  const gridColor = styles.getPropertyValue("--graph-grid").trim();
  const textColor = styles.getPropertyValue("--heading").trim();
  const graphBg = styles.getPropertyValue("--graph-bg").trim();
  // Remove Previous Chart
  if (cashFlowChart) {
    cashFlowChart.destroy();
  }

  cashFlowChart = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          label: "Amount",
          data: [income, expense],
          backgroundColor: ["#026d2b", "#a20000"],
          borderRadius: 6,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
          labels: {
            color: textColor,
          },
        },
      },

      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
        y: {
          beginAtZero: true,
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
      },
    },
  });
};

// --------------- SIDEBAR -----------------

let showDashboard = () => {
  settingsSection.classList.remove("view-active");
  dashboardSection.classList.add("view-active");

  dashboardBtn.classList.add("active");
  settingsBtn.classList.remove("active");
};
let showSettings = () => {
  dashboardSection.classList.remove("view-active");
  settingsSection.classList.add("view-active");

  settingsBtn.classList.add("active");
  dashboardBtn.classList.remove("active");
};

// ------ DASHBOARD ------
dashboardBtn.addEventListener("click", (event) => {
  event.preventDefault();
  showDashboard();
});

// ------ SETTINGS -------
settingsBtn.addEventListener("click", (event) => {
  event.preventDefault();
  showSettings();
});

showDashboard(); // Dashboard Visible by default on initial Load

// ------ TRANSACTION FORM OVERLAY ------
addTxBtn.addEventListener("click", () => {
  txOverlay.classList.add("active");
});

// Close Overlay
txOverlayClose.addEventListener("click", () => {
  txOverlay.classList.remove("active");
});

// --------------- NAVBAR -----------------
// Display Current User
navUserName.textContent = userSettings?.name || currentUser;

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
});

// Tabular UI
let tableUi = (data = txArray) => {
  tableBody.innerHTML = "";
  data.forEach((elem, index) => {
    const amountClass = elem.type === "income" ? "income" : "expense";
    tableBody.innerHTML += `<tr>
                        <td>${elem.date}</td>
                        <td><strong>${elem.description}</strong></td>
                        <td><span class="tag">${elem.category}</span></td>
                        <td class="${amountClass}">${elem.amount}</td>
                        <td>
                          <button onClick="updateTransaction('${elem.id}')" class="action-btn btn-edit">
                            <img src="./icons/edit.png" alt="">
                          </button>
                          <button onclick="deleteTransaction('${elem.id}')" class="action-btn btn-delete">
                            <img src="./icons/Delete.png" alt="">
                          </button>
                        </td>
                      </tr>`;
  });
};

tableUi();
totalTransactions.textContent = txArray.length;
overview();

// ---------- ADD TRANSACTION -------------
txForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let type = event.target[0].value;
  let description = event.target[1].value;
  let amount = event.target[2].value;
  let date = event.target[3].value;
  let category = event.target[4].value;

  // Converting Extracted form data into Object Format
  let txObj = {
    id: Date.now(),
    type,
    description,
    amount,
    date,
    category,
  };

  if (updateIndex !== null) {
    txArray[updateIndex] = txObj;
    updateIndex = null;
    localStorage.setItem(
      `Transactions_${currentUser}`,
      JSON.stringify(txArray),
    );
  } else {
    txArray.push(txObj);
    localStorage.setItem(
      `Transactions_${currentUser}`,
      JSON.stringify(txArray),
    );
  }

  tableUi();
  totalTransactions.textContent = txArray.length;
  overview();

  txForm.reset();
  txOverlay.classList.remove("active");
});

// RESET ALL DATA
resetBtn.addEventListener("click", () => {
  if (confirm("Delete All Transactions?")) {
    txArray = [];
    localStorage.setItem(
      `Transactions_${currentUser}`,
      JSON.stringify(txArray),
    );
    tableUi();
    overview();
    totalTransactions.textContent = txArray.length;
  } else {
  }
});

// SEARCH TRANSACTIONS
searchInput.addEventListener("input", () => {
  let searchText = searchInput.value.toLowerCase().trim();
  let filteredArray = txArray.filter((elem) => {
    return (
      elem.description.toLowerCase().includes(searchText) ||
      elem.category.toLowerCase().includes(searchText) ||
      elem.type.toLowerCase().includes(searchText) ||
      elem.amount.toString().includes(searchText) ||
      elem.date.includes(searchText)
    );
  });
  tableUi(filteredArray);
  overview(filteredArray);
});

// FILTER TRANSACTIONS
filterInput.addEventListener("change", () => {
  const selectedType = filterInput.value;

  if (selectedType === "all") {
    tableUi();
    overview();
    return;
  }

  const filteredArray = txArray.filter((transaction) => {
    return transaction.type === selectedType;
  });
  tableUi(filteredArray);
  overview(filteredArray);
});

// SETTINGS
settingsForm.addEventListener("submit", (e) => {
  e.preventDefault();

  userSettings.name = settingsName.value.trim();
  userSettings.currency = settingsCurrency.value;

  localStorage.setItem(`Settings_${currentUser}`, JSON.stringify(userSettings));

  navUserName.textContent = userSettings.name;

  overview(); // Refresh overview cards
  tableUi(); // Refresh table if you show currency there

  alert("Settings Saved!");
});

// THEME TOGGLE
themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-theme");

  if (themeToggle.checked) {
    localStorage.setItem(`theme_${currentUser}`, "dark");
  } else {
    localStorage.setItem(`theme_${currentUser}`, "light");
  }
  overview();
});

// UPDATE TRANSACTION
const updateTransaction = (idNum) => {
  txOverlay.classList.add("active");
  txOverlayHeader.textContent = "Edit Transaction";

  let transaction = txArray.find((elem) => elem.id == idNum);

  updateIndex = txArray.findIndex((elem) => elem.id == idNum);

  txForm[0].value = transaction.type;
  txForm[1].value = transaction.description;
  txForm[2].value = transaction.amount;
  txForm[3].value = transaction.date;
  txForm[4].value = transaction.category;

  overview();
};

// DELETE TRANSACTION
const deleteTransaction = (id) => {
  if (confirm("Are you sure you want to delete this transaction?")) {
    const index = txArray.findIndex((elem) => elem.id == id);
    txArray.splice(index, 1);
    localStorage.setItem(
      `Transactions_${currentUser}`,
      JSON.stringify(txArray),
    );
    tableUi();
    totalTransactions.textContent = txArray.length;
    overview();
  } else {
  }
};
