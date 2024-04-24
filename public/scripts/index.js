const menuContainer = document.getElementById('menu');
const posContainer = document.getElementById('posContainer');

const posCardButton = document.getElementById('posButton');
const printButton = $('#printLabels');

const printLabels = (data, endPoint) => {
    printButton.addClass('disabled')
    printButton.attr('disabled')
    $.ajax({
        type: "POST",
        url: endPoint,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data : JSON.stringify(data),
        async: true,
        success: (res) => {
            $.toast({
                heading: 'Success', text: res.message,
                bgColor: '#228B22', position: 'bottom-center',
                stack: false,
                loader: false
            });
            printButton.removeClass('disabled')
            printButton.removeAttr('disabled')
            $('#mdlLabel').modal('hide')
            if(endPoint.includes('Kanban')) return;
            associateTable.ajax.reload();
        },
        error: function (err) {
            $.toast({
                heading: 'Error', text: 'Please Refresh Entire Web Page',
                bgColor: '#d50000', position: 'bottom-center',
                stack: false,
                loader: false
            });
            printButton.removeClass('disabled')
        },
    });
};

const tableColumns = [
    { title: "#", data: "ASSOCIATE_NUMBER" },
    { title: "Nombre", data: "ASSOCIATE_NAME" },
    { title: "PL", data: "PL", className: 'txtcentro'},
    { title: "Reporta a", data: "REPORT_TO" },
];

const tableOptions = {
    dom: '<"row"<"col-sm-12"B>><"row"<"col-sm-10"Q><"col-sm-2"f>>' +
        't' +
        '<"row"<"col-sm-12"i>>',
    searchBuilder: true,
    select: true,
    scrollY: "45vh",
    scrollCollapse: true,
    deferRender: true,
    paging: false,
    sScrollX: "100%",
    language: {
        searchBuilder: {
            add: '+',
            title: {
                0: 'Filters',
            },
        }
    },
    buttons: {
        dom: {
            button: {
                tag: 'button',
                className: ''
            }
        },
        buttons: [
            {
                className: 'btn btn-md btn-primary',
                titleAttr: 'Select',
                text: 'Seleccionar todo',
                action: ( e, dt, node, config) => {
                    if (dt.data().toArray().length < 1) {
                        $.toast({
                            heading: 'HEY!', text: 'No existen registros que seleccionar',
                            bgColor: '#d50000', position: 'bottom-center',
                            stack: true
                        });
                        return;
                    }
                    dt.rows({ page: 'current' }).select();
                }
            },
            {
                className: 'btn btn-md btn-success',
                titleAttr: 'Print',
                text: 'Imprimir',
                action: ( e, dt, node, config) => {
                    if (dt.data().toArray().length < 1) {
                        $.toast({
                            heading: 'HEY!', text: 'No existen registros que seleccionar',
                            bgColor: '#d50000', position: 'bottom-center',
                            stack: true
                        });
                        return;
                    }
                    if(dt.rows({ selected: true }).data().toArray().length == 0) return;
                    $('#mdlLabel').modal('show');
                }
            }
        ],
    },
    ajax: {
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        url: '/getAssociates',
        dataType: 'json',
        dataSrc: function (res) {            
            return res.data;
        },
        complete: function (data) {},
        error: function (jqXHR, ajaxOptions, thrownError) {}
    },
    autoWidth: true,
    columns: [...tableColumns]
};

const associateTable = $('#associatesTable').DataTable(tableOptions);

printButton.on('click', () => {
    if(posContainer.style.display != 'none'){
        const toPrintData = associateTable.rows({ selected: true }).data().toArray();
        const dateInput = document.getElementById('monthInput');
        const selectedDate = dateInput.value;
        const copies = document.getElementById('copiesInput').value;
        printLabels({toPrintData, selectedDate, copies}, '/printLabels');
        return;
    }
    const toPrintData = kanbanTable.rows({ selected: true }).data().toArray();
    printLabels({toPrintData}, '/printKanban');
})

$('#mdlLabel').on('show.bs.modal', function (event) {
    const monthInput = document.getElementById('monthInput');
    const date = new Date();
    monthInput.value = date.toISOString().substring(0, 10);
    document.getElementById('copiesInput').value = 1;
})

posCardButton.addEventListener('click', () => {
    menuContainer.style.display = 'none';
    posContainer.style.display = '';
    associateTable.draw();
});