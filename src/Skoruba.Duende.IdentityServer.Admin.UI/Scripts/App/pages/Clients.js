document.addEventListener('DOMContentLoaded', function () {

    var exportClientsButton = document.getElementById('export-clients-button');
    if (exportClientsButton) {
        exportClientsButton.addEventListener('click', function () {
            var selectedClientIds = getSelectedClientIds();

            if (selectedClientIds.length > 0) {
                var export_actionUrl = 'ClientsExport';
                var export_queryString = selectedClientIds.map(function (id) { return 'clientIds=' + id; }).join('&');
                var export_fullUrl = export_actionUrl + '?' + export_queryString;

                window.location.href = export_fullUrl;
            } else {
                alert('Please select at least one client.');
            }
        });
    }

    function getSelectedClientIds() {
        var checkedBoxes_clients = document.querySelectorAll('input[type="checkbox"][id^="checkbox_"]:checked');
        var selectedClientIds = Array.prototype.map.call(checkedBoxes_clients, function (checkbox) {
            return checkbox.value;
        });

        return selectedClientIds;
    }

    var toggleAllCheckbox = document.getElementById('toggleAllCheckbox');
    if (toggleAllCheckbox) {
        toggleAllCheckbox.addEventListener('change', function () {
            console.log("toggleAllCheckbox changed");
            var checkboxes = document.querySelectorAll('input[type="checkbox"]');
            for (var i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i] !== toggleAllCheckbox) {
                    checkboxes[i].checked = toggleAllCheckbox.checked;
                }
            }
        });
    }
});
