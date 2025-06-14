

      
            function toggleTheme() {
                document.body.classList.toggle('dark-mode');
            }

            function addRawMaterial() {
                const container = document.getElementById('raw-materials-list');
                const row = document.createElement('div');
                row.className = 'row raw-item mb-2';
                row.innerHTML = `
      <div class="col-md-4"><input type="text" class="form-control" placeholder="Material Name"></div>
      <div class="col-md-4"><input type="number" class="form-control" placeholder="Quantity"></div>
      <div class="col-md-4"><input type="number" class="form-control" placeholder="Unit Cost"></div>
    `;
                container.appendChild(row);
            }

            function calculateCost() {
                let rawTotal = 0;
                const rawItems = document.querySelectorAll('.raw-item');
                rawItems.forEach(item => {
                    const quantity = parseFloat(item.children[1].children[0].value) || 0;
                    const cost = parseFloat(item.children[2].children[0].value) || 0;
                    rawTotal += quantity * cost;
                });

                const hours = parseFloat(document.getElementById('labor-hours').value) || 0;
                const rate = parseFloat(document.getElementById('labor-rate').value) || 0;
                const laborCost = hours * rate;

                const overhead = parseFloat(document.getElementById('overheads').value) || 0;
                const misc = parseFloat(document.getElementById('misc').value) || 0;

                const total = rawTotal + laborCost + overhead + misc;

                document.getElementById('raw-cost').textContent = rawTotal.toFixed(2);
                document.getElementById('labor-cost').textContent = laborCost.toFixed(2);
                document.getElementById('overhead-cost').textContent = overhead.toFixed(2);
                document.getElementById('misc-cost').textContent = misc.toFixed(2);
                document.getElementById('total-cost').textContent = total.toFixed(2);

                // Stylish Pie Chart
                if (window.costChart) {
                    window.costChart.destroy();
                }

                const ctx = document.getElementById('costChart').getContext('2d');
                window.costChart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: ['Raw Materials', 'Labor', 'Overheads', 'Miscellaneous'],
                        datasets: [{
                            label: 'Cost Breakdown',
                            data: [raw-cost, labor-Cost, over-head, misc-cost],
                            backgroundColor: ['#1f77b4', '#2ca02c', '#ff7f0e', '#d62728'],
                            borderColor: '#fff',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    font: {
                                        size: 14
                                    },
                                    color: '#333'
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const label = context.label || '';
                                        const value = context.raw || 0;
                                        return `${label}: ₹${value.toFixed(2)}`;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            function saveTemplate() {
                const name = document.getElementById('template-name').value.trim();
                if (!name) return alert("Please enter a name for the template.");

                const rawData = [];
                document.querySelectorAll('.raw-item').forEach(item => {
                    rawData.push({
                        name: item.children[0].children[0].value,
                        qty: item.children[1].children[0].value,
                        cost: item.children[2].children[0].value
                    });
                });

                const data = {
                    raw: rawData,
                    laborHours: document.getElementById('labor-hours').value,
                    laborRate: document.getElementById('labor-rate').value,
                    overheads: document.getElementById('overheads').value,
                    misc: document.getElementById('misc-cost').value
                };

                localStorage.setItem(`template-${name}`, JSON.stringify(data));
                updateTemplateList();
                alert("Template saved successfully!");
            }

            function loadTemplate() {
                const selected = document.getElementById('template-list').value;
                if (!selected) return alert("Please select a template to load.");
                const data = JSON.parse(localStorage.getItem(`template-${selected}`));
                if (!data) return;

                document.getElementById('raw-materials-list').innerHTML = '';
                data.raw.forEach(item => {
                    addRawMaterial();
                    const items = document.querySelectorAll('.raw-item');
                    const last = items[items.length - 1];
                    last.children[0].children[0].value = item.name;
                    last.children[1].children[0].value = item.qty;
                    last.children[2].children[0].value = item.cost;
                });

                document.getElementById('labor-hours').value = data.laborHours;
                document.getElementById('labor-rate').value = data.laborRate;
                document.getElementById('overheads').value = data.overheads;
                document.getElementById('misc').value = data.misc;

                alert("Template loaded!");
            }

            function deleteTemplate() {
                const selected = document.getElementById('template-list').value;
                if (!selected) return alert("Select a template to delete.");
                if (!confirm(`Are you sure you want to delete template: ${selected}?`)) return;

                localStorage.removeItem(`template-${selected}`);
                updateTemplateList();
                alert("Template deleted.");
            }

            function updateTemplateList() {
                const select = document.getElementById('template-list');
                select.innerHTML = '';
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('template-')) {
                        const name = key.replace('template-', '');
                        const option = document.createElement('option');
                        option.value = name;
                        option.textContent = name;
                        select.appendChild(option);
                    }
                });
            }
            let pieChart;  // keep reference to chart instance

            function showPieChart() {
                const raw = parseFloat(localStorage.getItem('last-raw')) || 0;
                const labor = parseFloat(localStorage.getItem('last-labor')) || 0;
                const overhead = parseFloat(localStorage.getItem('last-overhead')) || 0;
                const misc = parseFloat(localStorage.getItem('last-misc')) || 0;

                const ctx = document.getElementById('costPieChart').getContext('2d');

                // Show the canvas (was hidden)
                document.getElementById('costPieChart').style.display = 'block';

                // If chart already exists, destroy it before creating a new one
                if (pieChart) {
                    pieChart.destroy();
                }

                pieChart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: ['Raw Materials', 'Labor', 'Overheads', 'Miscellaneous'],
                        datasets: [{
                            data: [raw, labor, overhead, misc],
                            backgroundColor: ['#1f77b4', '#2ca02c', '#ff7f0e', '#d62728'],
                            borderColor: '#fff',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            }

            function exportTemplate(format) {
                const selected = document.getElementById('template-list').value;
                if (!selected) return alert("Please select a template to export.");

                const data = JSON.parse(localStorage.getItem(`template-${selected}`));
                if (!data) return alert("Template data not found.");

                if (format === 'pdf') {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    let y = 10;
                    doc.setFontSize(16);
                    doc.text(`Template: ${selected}`, 10, y);
                    y += 10;

                    doc.setFontSize(12);
                    doc.text(`Raw Materials:`, 10, y); y += 6;
                    data.raw.forEach((item, index) => {
                        doc.text(`${index + 1}. ${item.name}, Qty: ${item.qty}, Cost: ₹${item.cost}`, 12, y);
                        y += 6;
                    });
                    y += 4;
                    doc.text(`Labor Hours: ${data.laborHours}`, 10, y); y += 6;
                    doc.text(`Labor Rate: ₹${data.laborRate}`, 10, y); y += 6;
                    doc.text(`Overheads: ₹${data.overheads}`, 10, y); y += 6;
                    doc.text(`Miscellaneous: ₹${data.misc}`, 10, y);
                    doc.save(`${selected}.pdf`);

                } else if (format === 'excel') {
                    const ws_data = [["Material Name", "Quantity", "Unit Cost"]];
                    data.raw.forEach(item => {
                        ws_data.push([item.name, item.qty, item.cost]);
                    });

                    ws_data.push([], ["Labor Hours", data.laborHours]);
                    ws_data.push(["Labor Rate", data.laborRate]);
                    ws_data.push(["Overheads", data.overheads]);
                    ws_data.push(["Miscellaneous", data.misc]);

                    const wb = XLSX.utils.book_new();
                    const ws = XLSX.utils.aoa_to_sheet(ws_data);
                    XLSX.utils.book_append_sheet(wb, ws, "Template");
                    XLSX.writeFile(wb, `${selected}.xlsx`);
                }
            }

            window.onload = updateTemplateList;
    