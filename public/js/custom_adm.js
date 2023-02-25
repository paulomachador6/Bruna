/* Inicio Dropdown Navbar */
//let notification = document.querySelector(".notification");
let avatar = document.querySelector(".avatar");

dropMenu(avatar);
//dropMenu(notification);

function dropMenu(selector) {
    //console.log(selector);
    selector.addEventListener("click", () => {
        let dropdownMenu = selector.querySelector(".dropdown-menu");
        dropdownMenu.classList.contains("active") ? dropdownMenu.classList.remove("active") : dropdownMenu.classList.add("active");
    });
}
/* Fim Dropdown Navbar */

/* Inicio Sidebar Toggle / bars */
let sidebar = document.querySelector(".sidebar");
let bars = document.querySelector(".bars");

bars.addEventListener("click", () => {
    sidebar.classList.contains("active") ? sidebar.classList.remove("active") : sidebar.classList.add("active");
});

window.matchMedia("(max-width: 768px)").matches ? sidebar.classList.remove("active") : sidebar.classList.add("active");
/* Fim Sidebar Toggle / bars */

function actionDropdown(id) {
    const closeDropdownb = document.getElementById('actionDropdown' + id);

    if (closeDropdownb.classList.contains("show-dropdown-action")) {
        closeDropdownb.classList.remove("show-dropdown-action");
    } else {
        closeDropdownAction();
        document.getElementById("actionDropdown" + id).classList.toggle("show-dropdown-action");
    }
}

window.onclick = function (event) {
    if (!event.target.matches(".dropdown-btn-action")) {
        /*document.getElementById("actionDropdown").classList.remove("show-dropdown-action");*/
        closeDropdownAction();
    }
}

function closeDropdownAction() {
    var dropdowns = document.getElementsByClassName("dropdown-action-item");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i]
        if (openDropdown.classList.contains("show-dropdown-action")) {
            openDropdown.classList.remove("show-dropdown-action");
        }
    }
}

/* Inicio dropdown sidebar */

var dropdownSidebar = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdownSidebar.length; i++) {
    dropdownSidebar[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === "block") {
            dropdownContent.style.display = "none";
        } else {
            dropdownContent.style.display = "block";
        }
    });
}
/* Fim dropdown sidebar */

/* Inicío preview imagem do usuário */
function inputFilePreviewImg() {
    // RECEBER O SELETOR DO CAMPO IMAGEM.
    var new_image = document.querySelector('#image');

    // RECEBER O VALOR DO CAMPO
    var filePath = new_image.value;

    // EXTENSÕES DE IMAGEM PERMITIDAS.
    var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;

    // VERIFICAR SE A EXTENSÃO DA IMAGEM ENVIADA PELO USUÁRIO ESTÁ
    // NA LISTA DE EXTENSÕES PERMITIDAS
    if (allowedExtensions.exec(filePath)) {

        // VERIFICAR SE EXISTE IMAGEM
        if ((new_image.files) && (new_image.files[0])) {
            // FILEREADER() - LER O CONTEÚDO DOS ARQUIVOS.
            var reader = new FileReader();

            // ONLOAD - DISPARAR UM EVENTO QUANDO QUALQUER ELEMENTO TENHA SIDO CARREGADO.
            reader.onload = function (e) {
                // ENVIAR O PREVIEW DA IMAGEM PARA A PÁGINA HTML.
                document.getElementById('preview-img').innerHTML = "<img src='" + e.target.result + "' alt='imagem' class='view-image-user'>";
            }
        }

        // readAsDataURL - RETORNA OS DADOS DO FORMATO BLOB COMO UMA URL DE DADOS - Blob REPRESENTA UM ARQUIVO
        reader.readAsDataURL(new_image.files[0]);

    } else {
        // ENVIAR O PREVIEW DA IMAGEM PADRÃO PARA A PÁGINA HTML
        document.getElementById('preview-img').innerHTML = "<img src='/images/users/user.jpg' alt='imagem' class='view-image-user'>";
    }
}

/* Fim preview imagem do usuário */