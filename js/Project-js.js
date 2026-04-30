document.addEventListener("DOMContentLoaded", function() {
    var total_balance = document.getElementById("total_balance");

    if(total_balance.innerText === ""){
        total_balance.innerText = "$0";
    }
});

document.addEventListener("DOMContentLoaded", renderData);

let myChart;

function deleteList(index) {
    const data = getData();
    data.splice(index, 1);

    localStorage.setItem("transactions", JSON.stringify(data));
    renderData();
}

document.getElementById("transaction_form").addEventListener("submit", function(e) {
    e.preventDefault();

    const item_name = document.getElementById("item_name_txt").value;
    const amount = document.getElementById("amount_txt").value;
    const category = document.getElementById("category_select").value;

    const data = getData();
    data.push({ item_name, amount, category });

    localStorage.setItem("transactions", JSON.stringify(data));

    renderData();
    this.reset();
});

function getData() {
    return JSON.parse(localStorage.getItem("transactions")) || [];
}

function renderData() {
    const tbody = document.getElementById("transaction_body");
    tbody.innerHTML = "";

    const data = getData();

    let total = 0;

    data.forEach((item, index) => {
        total += parseFloat(item.amount);

        const row = `
            <tr class="shadow-md rounded-md">
                <td class="p-4 font-bold text-base text-slate-200">
                    ${item.item_name} <br>
                    <p class="font-bold text-white mt-1">$${item.amount}</p> <br>
                    <p class="bg-slate-500 rounded-md p-2 text-slate-100">${item.category}</p>
                </td>
                <td class="p-4 text-right">
                    <button onclick="deleteList(${index})" 
                        class="hover:bg-pink-800 p-4 bg-pink-700 rounded-md font-bold text-white">
                        Delete
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    document.getElementById("total_balance").innerText = "$" + total;

    startCharts();
}

function startCharts()
{
    const ctx = document.getElementById('myChart');

    const data = getData();

    let food = 0;
    let transport = 0;
    let fun = 0;

    data.forEach(item => {
        if (item.category === "Food") {
            food += parseFloat(item.amount);
        } else if (item.category === "Transport") {
            transport += parseFloat(item.amount);
        } else if (item.category === "Fun") {
            fun += parseFloat(item.amount);
        }
    });

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Food', 'Transport', 'Fun'],
            datasets: [{
                data: [food, transport, fun],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'bottom',
                     labels: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}
