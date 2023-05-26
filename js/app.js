import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js'
// import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDocs, query, limit, startAfter, orderBy } from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js'

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBN1HUQF8iP6p5VvOHt3l32xSRtxn4LFfI",
    authDomain: "testcomment1.firebaseapp.com",
    databaseURL: "https://testcomment1-default-rtdb.firebaseio.com",
    projectId: "testcomment1",
    storageBucket: "testcomment1.appspot.com",
    messagingSenderId: "587880311873",
    appId: "1:587880311873:web:8facf3597dbc9fb816eac0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


     
const audio = (() => {
    var instance = undefined;

    var getInstance = () => {
        if (!instance) {
            instance = new Audio();
            instance.autoplay = true;
            instance.src = document.getElementById('tombol-musik').getAttribute('data-url');
            instance.load();
            instance.currentTime = 0;
            instance.volume = 1;
            instance.muted = false;
            instance.loop = true;
        }

        return instance;
    };

    return {
        play: () => {
            getInstance().play();
        },
        pause: () => {
            getInstance().pause();
        }
    };
})();

const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

export const salin = (btn) => {
    navigator.clipboard.writeText(btn.getAttribute('data-nomer'));
    let tmp = btn.innerHTML;
    btn.innerHTML = 'Tersalin';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = tmp;
        btn.disabled = false;
    }, 1500);
};

const timer = () => {
    var countDownDate = (new Date(document.getElementById('tampilan-waktu').getAttribute('data-waktu').replace(' ', 'T'))).getTime();
    var time = undefined;
    var distance = undefined;

    time = setInterval(() => {
        distance = countDownDate - (new Date()).getTime();

        if (distance < 0) {
            clearInterval(time);
            time = undefined;
            return;
        }

        document.getElementById('hari').innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
        document.getElementById('jam').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById('menit').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('detik').innerText = Math.floor((distance % (1000 * 60)) / 1000);
    }, 1000);
};

// firebase.initialization(firebaseConfig);


export const buka = async () => {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('tombol-musik').style.display = 'block';
    audio.play();
    AOS.init();
    // await login();
    // await ucapin();
    await ucapkan();
    timer();
};

export const play = (btn) => {
    if (btn.getAttribute('data-status').toString() != 'true') {
        btn.setAttribute('data-status', 'true');
        audio.play();
        btn.innerHTML = '<i class="fa-solid fa-circle-pause"></i>';
    } else {
        btn.setAttribute('data-status', 'false');
        audio.pause();
        btn.innerHTML = '<i class="fa-solid fa-circle-play"></i>';
    }
};

export const resetForm = () => {
    document.getElementById('kirimUcapan').style.display = 'block';
    document.getElementById('hadiran').style.display = 'block';
    document.getElementById('labelhadir').style.display = 'block';
    document.getElementById('batal').style.display = 'none';
    // document.getElementById('kirimbalasan').style.display = 'none';
    // document.getElementById('idbalasan').value = null;
    // document.getElementById('balasan').innerHTML = null;
    document.getElementById('formnama').value = null;
    document.getElementById('hadiran').value = 0;
    document.getElementById('formpesan').value = null;
};

const innerCard = (comment) => {
    let result = '';

    comment.forEach((data) => {
        result += `
        <div class="card-body border-start bg-light py-2 ps-2 pe-0 my-2 ms-2 me-0" id="${data.uuid}">
            <div class="d-flex flex-wrap justify-content-between align-items-center">
                <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                    <strong>${escapeHtml(data)}</strong>
                </p>
                <small class="text-dark m-0 p-0" style="font-size: 0.75rem;">${data.created_at}</small>
            </div>
            <hr class="text-dark my-1">
            <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${escapeHtml(data.komentar)}</p>
            <button style="font-size: 0.8rem;" onclick="balasan(this)" data-uuid="${data.uuid}" class="btn btn-sm btn-outline-dark rounded-4 py-0">Balas</button>
            ${innerCard(data.comment)}
        </div>`;
    });

    return result;
};

const rindirCard = (data) => {
    const DIV = document.createElement('div');
    DIV.classList.add('mb-3');
    DIV.innerHTML = `
    <div class="card-body bg-light shadow p-3 m-0 rounded-4" id="${data.id}">
        <div class="d-flex flex-wrap justify-content-between align-items-center">
            <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                <strong class="me-1">${data.nama}</strong>${data.hadir ? '<i class="fa-solid fa-circle-check text-success"></i>' : '<i class="fa-solid fa-circle-xmark text-danger"></i>'}
            </p>
        </div>
        <hr class="text-dark my-1">
        <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${data.komentar}</p>
    </div>`;
    return DIV;
};


const renderCard = (data) => {
    const DIV = document.createElement('div');
    DIV.classList.add('mb-3');
    DIV.innerHTML = `
    <div class="card-body bg-light shadow p-3 m-0 rounded-4" id="${data.id}">
        <div class="d-flex flex-wrap justify-content-between align-items-center">
            <p class="text-dark text-truncate m-0 p-0" style="font-size: 0.95rem;">
                <strong class="me-1">${escapeHtml(data)}</strong>${data.hadir ? '<i class="fa-solid fa-circle-check text-success"></i>' : '<i class="fa-solid fa-circle-xmark text-danger"></i>'}
            </p>
        </div>
        <hr class="text-dark my-1">
        <p class="text-dark mt-0 mb-1 mx-0 p-0" style="white-space: pre-line">${escapeHtml(data.komentar)}</p>
        <button style="font-size: 0.8rem;" onclick="balasan(this)" data-uuid="${data.id}" class="btn btn-sm btn-outline-dark rounded-4 py-0">Balas</button>
        ${innerCard(data.komentar)}
    </div>`;
    return DIV;
};

const renderLoading = (num) => {
    let hasil = '';
    for (let index = 0; index < num; index++) {
        hasil += `
        <div class="mb-3">
            <div class="card-body bg-light shadow p-3 m-0 rounded-4">
                <div class="d-flex flex-wrap justify-content-between align-items-center placeholder-glow">
                    <span class="placeholder bg-secondary col-5"></span>
                    <span class="placeholder bg-secondary col-3"></span>
                </div>
                <hr class="text-dark my-1">
                <p class="card-text placeholder-glow">
                    <span class="placeholder bg-secondary col-6"></span>
                    <span class="placeholder bg-secondary col-5"></span>
                    <span class="placeholder bg-secondary col-12"></span>
                </p>
            </div>
        </div>`;
    }

    return hasil;
}

export const pagination = (() => {

    const perPage = 3;
    var pageNow = 0;
    var resultData = 0;

    var disabledPrevious = () => {
        document.getElementById('previous').classList.add('disabled');
    };

    var disabledNext = () => {
        document.getElementById('next').classList.add('disabled');
    };

    var buttonAction = async (button) => {
        let tmp = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;
        await ucapin();
        button.disabled = false;
        button.innerHTML = tmp;
        // document.getElementById('daftarucapan').scrollIntoView({ behavior: 'smooth' });
        // document.getElementById('daftarucapin').scrollIntoView({ behavior: 'smooth' });

    };

    return {
        getPer: () => {
            return perPage;
        },
        getNext: () => {
            return pageNow;
        },
        reset: async () => {
            pageNow = 0;
            resultData = 0;
            // await ucapan();
            await ucapin();
            document.getElementById('next').classList.remove('disabled');
            disabledPrevious();
        },
        setResultData: (len) => {
            resultData = len;
            if (resultData < perPage) {
                disabledNext();
            }
        },
        previous: async (button) => {
            if (pageNow < 0) {
                disabledPrevious();
            } else {
                pageNow -= perPage;
                disabledNext();
                await buttonAction(button);
                document.getElementById('next').classList.remove('disabled');
                if (pageNow <= 0) {
                    disabledPrevious();
                }
            }
        },
        next: async (button) => {
            if (resultData < perPage) {
                disabledNext();
            } else {
                pageNow += perPage;
                disabledPrevious();
                await buttonAction(button);
                document.getElementById('previous').classList.remove('disabled');
            }
        }
    };
})();

function paginator(items, page, per_page) {

        var page = page || 1,
        per_page = per_page || 3,
        offset = (page - 1) * per_page,
      
        paginatedItems = items.slice(offset).slice(0, per_page),
        total_pages = Math.ceil(items.length / per_page);
        return {
            page: page,
            per_page: per_page,
            pre_page: page - 1 ? page - 1 : null,
            next_page: (total_pages > page) ? page + 1 : null,
            total: items.length,
            total_pages: total_pages,
            data: paginatedItems
        };
    };

var theDatas = []
let pageSize = 3
let currentPage = 1


export const ucapkan = async () => {
    

    const dataTamu = await getDocs(query(collection(db, 'tamu')));

    // const dataTamu = await response.json()
    theDatas = dataTamu.docs.map((f) => f.data())
}
// ucapkan()

const renderData = async (page = 1) => {

    await ucapkan()

    if (page == 1) {
        document.querySelector('#pruv').classList.add('disabled')
    } else {
        document.querySelector('#pruv').classList.remove('disabled')
    }

    if (page == numberOfPages()) {
        document.querySelector('#nuxt').classList.add('disabled')
    } else {
        document.querySelector('#nuxt').classList.remove('disabled')


    }

    let UCAPKAN = document.getElementById('daftarucapkan');

    theDatas.filter((row, index) => {
        UCAPKAN.innerHTML = null;

        let start = (currentPage - 1) * pageSize
        let end = currentPage * pageSize

        if (index >= start && index < end) return true;
    })
    .forEach((f) => UCAPKAN.appendChild(rindirCard(f)))

    
}
renderData()

function previousPage () {
    if (currentPage > 1) {
        currentPage--;
        renderData(currentPage)
    }
}

function nextPage () {
    if (theDatas.length / pageSize > currentPage) {
        currentPage++;
        renderData(currentPage)
    }
        
}

function numberOfPages() {
    return Math.ceil(theDatas.length / pageSize)
}

document.querySelector('#pruv').addEventListener('click', previousPage, false);
document.querySelector('#nuxt').addEventListener('click', nextPage, false);

      
export const kirimUcapan = async () => {
     let nama = document.getElementById('formnama').value;
     let hadir = document.getElementById('hadiran').value;
     let komentar = document.getElementById('formpesan').value;

     if (nama.length == 0) {
         alert('Nama tidak boleh kosong!');
         return;
     }
     if (komentar.length >= 35) {
         alert('Panjang maksimal 35 karakter');
         return;
     }
     if (hadir == 0) {
         alert('Silahkan pilih kehadiran');
         return;
     }

     let tmp = document.getElementById('kirimUcapan').innerHTML;
     document.getElementById('kirimUcapan').innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;

     const REQ = {
            nama: nama,
            hadir: hadir == 1,
            komentar: komentar
        };

     const docRef = await addDoc(collection(db, "tamu"), REQ);
     resetForm();
     pagination.reset();
     document.location.reload();
    document.getElementById('kirimUcapan').disabled = false;
    document.getElementById('kirimUcapan').innerHTML = tmp;

 };

window.addEventListener('load', () => {
    let modal = new bootstrap.Modal('#exampleModal');
    let name = (new URLSearchParams(window.location.search)).get('to') ?? '';

    if (name.length == 0) {
        document.getElementById('namatamu').remove();
    } else {
        let div = document.createElement('div');
        div.classList.add('m-2');
        div.innerHTML = `
        <p class="mt-0 mb-1 mx-0 p-0 text-dark">Kepada Yth Bapak/Ibu/Saudara/i</p>
        <h2 class="text-dark">${escapeHtml(name)}</h2>
        `;

        document.getElementById('formnama').value = name;
        document.getElementById('namatamu').appendChild(div);
    }

    modal.show();
}, false);
