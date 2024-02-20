let myChart;
let dataPerolehan = ""; //data perolehan
let dataCaleg = ""; //data nama caleg
let dataPartai = ""; //data partai
let onPartai = 1;
// Daftar URL yang ingin di fetch
const urls = [
    "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdprdk/32/3212/321203.json",
    "https://sirekap-obj-data.kpu.go.id/pemilu/caleg/partai/321203.json",
    "https://sirekap-obj-data.kpu.go.id/pemilu/partai.json"
];
let dataKu = {
    idCaleg: [],
    namaCaleg: [],
    hasilSuara: [],
    namaPartai: [],
    latestUpdate: ""
}
let data = {
    labels: [],
    datasets: [{
        label: "Perolehan Suara ",
        backgroundColor: "green",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 2,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        data: [65, 59, 20, 81, 56, 55, 40],
    }]
};

let options = {
    maintainAspectRatio: false,
    scales: {
        y: {
            stacked: true,
            grid: {
                display: true,
                color: "rgba(255,99,132,0.2)"
            }
        },
        x: {
            grid: {
                display: false
            }
        }
    }
};
let bDropDown = false;
const dropdown = document.getElementById('dropdown');

function buildTheChart() {
    if (!myChart) {
        myChart = new Chart('chart', {
            type: 'bar',
            options: options,
            data: data
        });
    } else {
        console.log("update chart");
        myChart.update();
    }
}

function fetchThisApi(apiUrl) {
    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation', error);
            throw error; // Re-throw error agar bisa ditangani di luar fungsi fetchThisApi
        });
}

// Lakukan fetch ke semua URL secara paralel
Promise.all(urls.map(url => fetchThisApi(url)))
    .then(dataArray => {
        // dataArray berisi hasil dari fetch ke setiap URL
        [dataPerolehan, dataCaleg, dataPartai] = dataArray; // Anda dapat menentukan variabel masing-masing di sini
        filiterAllData(); //panggil function ini ketika promise selesai semua
    })
    .catch(error => {
        // Tangani kesalahan jika ada
        console.error('Error while fetching data:', error);
        document.getElementById('latestProgress').innerHTML = "JARINGAN BERMASALAH, COBA LAGI REFRESH HALAMAN ATAU TUNGGU BEBERAPA SAAT LAGI.";
    });

function filiterAllData() {
    // Melakukan iterasi melalui objek dan mengambil nilai dari setiap objek
    dataKu.idCaleg = [];
    dataKu.namaCaleg = [];
    for (let key in dataCaleg[onPartai]) {
        dataKu.idCaleg.push(key);
        dataKu.namaCaleg.push(dataCaleg[onPartai][key].nama);
    }
    data.labels = dataKu.namaCaleg;

    dataKu.hasilSuara = [];
    for (let key in dataPerolehan.table[onPartai]) {
        dataKu.hasilSuara.push(dataPerolehan.table[onPartai][key]);
    }

    dataKu.namaPartai = [];
    for (let key in dataPartai) {
        dataKu.namaPartai.push(dataPartai[key].nama);
    }

    data.datasets[0].data = dataKu.hasilSuara;
    data.datasets[0].data.pop();
    data.datasets[0].data.pop();

    let teks1 = 'Jumlah Suara Sah Partai Politik';
    let teks2 = dataPerolehan.table[onPartai].jml_suara_partai;
    document.getElementById('suaraPartai').innerHTML = teks1.padEnd(50, '\xa0') + " : " + addTitikRibuan(teks2);
    teks1 = 'Jumlah Suara Sah Partai Politik dan Calon';
    teks2 = dataPerolehan.table[onPartai].jml_suara_total;
    document.getElementById('suaraPartaiNCaleg').innerHTML = teks1.padEnd(43, '\xa0') + " : " + addTitikRibuan(teks2);

    document.getElementById('latestUpdate').innerHTML = ("Update Data").padEnd(60, '\xa0') + " : " + dataPerolehan["ts"];

    let doneTPS = dataPerolehan["progres"].progres;
    let allTPS = dataPerolehan["progres"].total;
    let persenProg = doneTPS / allTPS * 100;
    document.getElementById('latestProgress').innerHTML = ("Progres").padEnd(64, '\xa0') + " : " + doneTPS + " dari " + allTPS + " (" + persenProg.toFixed(2) + "%)";


    //
    data.datasets[0].backgroundColor = dataPartai[onPartai].warna;

    //

    //if(myChart)myChart.destroy();
    //buildTheChart();
    if (!bDropDown) {
        bDropDown = true;
        // Memasukkan data dari array ke dalam dropdown
        dataKu.namaPartai.forEach((item, index) => {
            let option = document.createElement('option');
            option.textContent = item;
            option.value = index; // Nilai opsi disetel menjadi indeks
            dropdown.appendChild(option);
        });
    }
    //create Chart
    buildTheChart();
}

// event if dropdown change
dropdown.addEventListener('change', setPartai);

function setPartai(evt) {
    let selected = parseInt(evt.target.value) + 1;
    onPartai = selected;
    filiterAllData();
}

///
function addTitikRibuan(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}