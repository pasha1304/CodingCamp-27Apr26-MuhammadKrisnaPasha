document.addEventListener("DOMContentLoaded", function() {
    var total_balance = document.getElementById("total_balance");

    if(total_balance.innerText === ""){
        total_balance.innerText = "$0";
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        updateToggleUI(true);
    }

    var x = 10;
    var y = 20;
    console.log(x + y);
});

function toggleTheme() {
    const isLight = document.body.classList.toggle("light-mode");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    updateToggleUI(isLight);

    if (myChart) {
        startCharts();
    }
}

function updateToggleUI(isLight) {
    const icon  = document.getElementById("theme_icon");
    const label = document.getElementById("theme_label");
    if (isLight) {
        icon.textContent  = "🌙";
        label.textContent = "Dark";
    } else {
        icon.textContent  = "☀️";
        label.textContent = "Light";
    }
}

document.addEventListener("DOMContentLoaded", renderData);
document.addEventListener("DOMContentLoaded", renderCategory);

let myChart;

function deleteList(index) {
    const data = getData();
    data.splice(index, 1);

    localStorage.setItem("transactions", JSON.stringify(data));
    renderData();
}

function deleteCategory(index) {
    const data = getCategory();
    data.splice(index, 1);

    localStorage.setItem("categories", JSON.stringify(data));
    renderCategory();
    renderCategoryTable();
}

document.getElementById("transaction_form").addEventListener("submit", function(e) {
    e.preventDefault();

    const item_name = document.getElementById("item_name_txt").value;
    const amount    = document.getElementById("amount_txt").value;
    const category  = document.getElementById("category_select").value;

    const data = getData();
    data.push({ item_name, amount, category });

    localStorage.setItem("transactions", JSON.stringify(data));

    renderData();
    this.reset();
});

function getData() {
    return JSON.parse(localStorage.getItem("transactions")) || [];
}

function getCategory() {
    return JSON.parse(localStorage.getItem("categories")) || [];
}

function renderCategoryTable() {
    const cat_body = document.getElementById("cat_table_body");
    cat_body.innerHTML  = "";

    const data = getCategory();

    data.forEach(function(item, index){
        const row = document.createElement("tr");
        row.className = "border-t border-slate-700";
        row.innerHTML = `
            <td class="p-3">${item.category}</td> 
            <td class="p-3 text-center">
                    <button onclick="deleteCategory(${index})" class="hover:bg-pink-800 bg-pink-700 px-3 py-1 rounded text-white">
                        Delete
                    </button>
            </td>
        `;  

        cat_body.appendChild(row);
    });
}

function renderCategory() {
    const select     = document.getElementById("category_select");
    const sortSelect = document.getElementById("sort_category");
    const data       = getCategory();

    select.innerHTML = "";
    data.forEach(function(item) {
        const option = document.createElement("option");
        option.value       = item.category;
        option.textContent = item.category;
        select.appendChild(option);
    });

    const currentSort = sortSelect.value;
    sortSelect.innerHTML = '<option value="all">All Categories</option>';
    data.forEach(function(item) {
        const option = document.createElement("option");
        option.value       = item.category;
        option.textContent = item.category;
        sortSelect.appendChild(option);
    });

    if ([...sortSelect.options].some(function(o) { return o.value === currentSort; })) {
        sortSelect.value = currentSort;
    }
}

function renderData() {
    const tbody     = document.getElementById("transaction_body");
    tbody.innerHTML = "";

    const data      = getData();
    const filterCat = document.getElementById("sort_category") 
                        ? document.getElementById("sort_category").value 
                        : "all";

    let total = 0;

    data.forEach(function(item, index) {
        total += parseFloat(item.amount) || 0;

        if (filterCat !== "all" && item.category !== filterCat) return;

        const row = document.createElement("tr");
        row.className = "shadow-md rounded-md";
        row.innerHTML =
            '<td class="p-4 font-bold text-base text-slate-200">' +
                item.item_name + '<br>' +
                '<p class="font-bold text-white mt-1">' + item.amount + '</p><br>' +
                '<p class="bg-slate-500 rounded-md p-2 text-slate-100">' + item.category + '</p>' +
            '</td>' +
            '<td class="p-4 text-right">' +
                '<button onclick="deleteList(' + index + ')" ' +
                    'class="hover:bg-pink-800 p-4 bg-pink-700 rounded-md font-bold text-white">' +
                    'Delete' +
                '</button>' +
            '</td>';

        tbody.appendChild(row);
    });

    document.getElementById("total_balance").innerText = "$" + total;

    startCharts();
}

function showAddCategory() {
    const container = document.getElementById("new_category_form");
    let form = document.getElementById("add_category_form");
    let cat_list = document.getElementById("cat_list");

    if (!form) {
        const insert = `
            <div id="add_category_form" class="shadow-md rounded-md bg-slate-700 p-4 mt-5">
                <p class="text-left font-bold text-lg text-slate-100">Add New Category</p>
                
                <div class="mt-3">
                    <label for="add_category_txt" class="text-slate-200">New Category</label><br>
                    <input id="add_category_txt" class="text-slate-800 w-full mt-2 bg-slate-100 rounded-md p-2" type="text">
                </div>

                <div class="mt-5 grid grid-cols-2 gap-4">
                    <div>
                        <button id="add_category_btn" class="hover:bg-emerald-600 w-full bg-emerald-500 rounded-md p-2 font-bold text-white">
                            Submit
                        </button>
                    </div>

                    <div>
                        <button onclick="hideAddCategory()" class="hover:bg-pink-800 bg-pink-700 w-full rounded-md p-2 font-bold text-white">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            <div id="cat_list" class="shadow-md rounded-md bg-slate-700 p-2 mt-5 max-h-[205px] overflow-auto">
                <table id="cat_table" class="w-full border border-slate-700 rounded-md text-slate-200">
                    <thead class="bg-slate-800">
                        <tr>
                            <th class="p-3 text-left">Category</th>
                            <th class="p-3 text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody id="cat_table_body" class="bg-slate-800">
                        <tr class="border-t border-slate-700 transition">

                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        container.innerHTML += insert;

        renderCategoryTable();

        document.getElementById("add_category_btn").addEventListener("click", function(e) {
            e.preventDefault();

            const input    = document.getElementById("add_category_txt");
            const category = input.value.trim();

            if (!category) return;

            const data = getCategory();
            data.push({ category });

            localStorage.setItem("categories", JSON.stringify(data));

            renderCategory();
            renderCategoryTable();
            input.value = "";
        });
    } else {
        form.classList.remove("hidden");
        cat_list.classList.remove("hidden");
    }
}

function hideAddCategory() {
    const form = document.getElementById("add_category_form");
    if (form) {
        form.classList.add("hidden");
    }

    const cat_list = document.getElementById("cat_list");
    if (cat_list) {
        cat_list.classList.add("hidden");
    }
}

function startCharts() {
    const ctx = document.getElementById("myChart");

    const transactions = getData();
    const categories   = getCategory();

    // Build totals map from all saved categories
    const totals = {};
    categories.forEach(function(c) {
        totals[c.category] = 0;
    });

    // Sum amounts per category
    transactions.forEach(function(item) {
        const cat = item.category;
        if (totals[cat] === undefined) totals[cat] = 0;
        totals[cat] += parseFloat(item.amount) || 0;
    });

    // Only show categories that have at least one transaction
    const activeLabels = Object.keys(totals).filter(function(k) { return totals[k] > 0; });
    const activeData   = activeLabels.map(function(k) { return totals[k]; });

    const palette     = generateColors(activeLabels.length);
    const isLight     = document.body.classList.contains("light-mode");
    const legendColor = isLight ? "#1e293b" : "#ffffff";

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: activeLabels,
            datasets: [{
                data: activeData,
                backgroundColor: palette,
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: legendColor
                    }
                }
            }
        }
    });
}

function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = Math.round((360 / count) * i);
        colors.push("hsl(" + hue + ", 40%, 65%)");
    }
    return colors;
}
