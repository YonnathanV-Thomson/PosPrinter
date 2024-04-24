const kanbanContainer = document.getElementById('kanbanContainer'); 
const kanbanCardButton = document.getElementById('kanbanButton');

const kanbanColumns = [
    { title: "ProductLine", data: "productLine" },
    { title: "ItemClass", data: "itemClass" },
    { title: "KanbanCardNo", data: "kanbanCardNo"},
    { title: "KanbanQty", data: "kanbanQty" },
    { title: "CardType", data: "cardType" },
    { title: "Item", data: "item" },
    { title: "Description", data: "description" },
    { title: "ItemStatus", data: "itemStatus" },
    { title: "SupplyStatus", data: "supplyStatus" },
    { title: "SupplierCategory", data: "supplierCategory" },
    { title: "DefaultBuyerName", data: "defaultBuyerName" },
    { title: "KanbanLeadTime", data: "kanbanLeadTime" },
    { title: "ProcessingLeadTime", data: "processingLeadTime" },
    { title: "KanbanCardUpdateAt", data: "kanbanCardUpdateAt" },
    { title: "PlannerCode", data: "plannerCode" },
    { title: "KanbanClass", data: "kanbanClass" },
    { title: "ItemLocation", data: "itemLocation" },
    { title: "SafetyStock", data: "safetyStock" },
    { title: "KanbanLocation", data: "kanbanLocation" },
    { title: "KanbanComment", data: "kanbanComment" },
];

const kanbanOptions =  {...tableOptions};
kanbanOptions.ajax = {
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    url: '/getKanban',
    dataType: 'json',
    dataSrc: function (res) {
        console.log(res[0])   
        return res;
    },
    complete: function (data) {},
    error: function (jqXHR, ajaxOptions, thrownError) {}
};
kanbanOptions.columns = [...kanbanColumns];

const kanbanTable = $('#kanbanTable').DataTable(kanbanOptions);

kanbanCardButton.addEventListener('click', () => {
    menuContainer.style.display = 'none'; 
    kanbanContainer.style.display = '';
    kanbanTable.draw();
});