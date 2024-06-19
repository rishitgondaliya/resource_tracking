document.addEventListener('DOMContentLoaded', (event) => {
    const openModalButtons = document.querySelectorAll('.clickable-class');
    const closeModalButtons = document.querySelectorAll('[data-close-button]');
    const overlay = document.getElementById('overlay');
    let currentClassId = null; // Variable to track the current class ID

    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.querySelector(button.dataset.modalTarget);
            const title = button.dataset.modalTitle;
            const classId = button.dataset.classId; // Extract classId when modal opens
            currentClassId = classId; // Update currentClassId

            const modalTitle = modal.querySelector('.modal-title');
            if (modalTitle) modalTitle.textContent = title;
            openModal(modal);
            fetchAndDisplayAssets(currentClassId); // Fetch and display assets for this class ID
        });
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    document.getElementById('addAssetButton').addEventListener('click', () => {
        const addAssetForm = document.getElementById('addAssetForm');
        if (addAssetForm.style.display === 'block') {
            addAssetForm.style.display = 'none';
        } else {
            addAssetForm.style.display = 'block';
            document.getElementById('deleteAssetForm').style.display = 'none';
            document.getElementById('updateAssetForm').style.display = 'none';
        }
    });

    // Function to open a modal
    function openModal(modal) {
        if (modal == null) return;
        modal.classList.add('active');
        overlay.classList.add('active');
    }

    // Function to close a modal
    function closeModal(modal) {
        if (modal == null) return;
        modal.classList.remove('active');
        overlay.classList.remove('active');
    }

    // Clicking on the overlay closes the modal
    overlay.addEventListener('click', () => {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            closeModal(modal);
        });
    });

    // Adding an asset and sending it to save_asset.php
    document.getElementById('submitAsset').addEventListener('click', () => {
        const name = document.getElementById('assetName').value;
        const quantity = document.getElementById('assetQuantity').value;

        fetch('save_asset.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `classId=${currentClassId}&name=${encodeURIComponent(name)}&quantity=${quantity}`
        })
        .then(response => response.text())
        .then(data => {
            console.log(data); // Log the success message from the server
            fetchAndDisplayAssets(currentClassId); // Refresh the assets list
        });

        // Optionally reset form values here
        document.getElementById('assetName').value = '';
        document.getElementById('assetQuantity').value = '';
        document.getElementById('addAssetForm').style.display = 'none'; // Hide the form
    });

    // Function to fetch and display assets
    function fetchAndDisplayAssets(classId) {
        fetch(`fetch_assets.php?classId=${classId}`)
            .then(response => response.json())
            .then(assets => {
                const container = document.getElementById('assetsContainer');
                container.innerHTML = ''; // Clear existing assets
                assets.forEach(asset => {
                    const assetDiv = document.createElement('div');
                    assetDiv.classList.add('assetDivision');
                    assetDiv.classList.add('asset');
                    
                    assetDiv.innerHTML = `Name: ${asset.name}<br>Quantity: ${asset.quantity}`;
                    container.appendChild(assetDiv);
                });
            });
    }

    document.getElementById('deleteAssetButton').addEventListener('click', () => {
        const deleteAssetForm = document.getElementById('deleteAssetForm');
        if (deleteAssetForm.style.display === 'block') {
            deleteAssetForm.style.display = 'none';
        } else {
            deleteAssetForm.style.display = 'block';
            document.getElementById('updateAssetForm').style.display = 'none';
            document.getElementById('addAssetForm').style.display = 'none';
        }
    });
    
    document.getElementById('deleteAsset').addEventListener('click', () => {
        const nameToDelete = document.getElementById('assetNameToDelete').value;
    
        fetch('delete_asset.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `classId=${currentClassId}&name=${encodeURIComponent(nameToDelete)}`
        })
        .then(response => response.text())
        .then(data => {
            console.log(data); // Log the success or error message from the server
            fetchAndDisplayAssets(currentClassId); // Refresh the assets list to reflect the deletion
        });
    
        // Optionally reset form values and hide the form here
        document.getElementById('assetNameToDelete').value = '';
        document.getElementById('deleteAssetForm').style.display = 'none'; // Hide the form
    });

    document.getElementById('updateAssetButton').addEventListener('click', () => {
        const updateAssetForm = document.getElementById('updateAssetForm');
        if (updateAssetForm.style.display === 'block') {
            updateAssetForm.style.display = 'none';
        } else {
            updateAssetForm.style.display = 'block';
            document.getElementById('deleteAssetForm').style.display = 'none';
            document.getElementById('addAssetForm').style.display = 'none';
        }
    });
    
    document.getElementById('updateAsset').addEventListener('click', () => {
        const nameToUpdate = document.getElementById('assetNameToUpdate').value;
        const quantityToUpdate = document.getElementById('assetQuantityToUpdate').value;
    
        fetch('update_asset.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `classId=${currentClassId}&name=${encodeURIComponent(nameToUpdate)}&quantity=${quantityToUpdate}`
        })
        .then(response => response.text())
        .then(data => {
            console.log(data); // Log the success or error message from the server
            fetchAndDisplayAssets(currentClassId); // Refresh the assets list to reflect the update
        });
    
        // Optionally reset form values and hide the form here
        document.getElementById('assetNameToUpdate').value = '';
        document.getElementById('assetQuantityToUpdate').value = '';
        document.getElementById('updateAssetForm').style.display = 'none'; // Hide the form
    });
    
    document.getElementById('clearAllButton').addEventListener('click', () => {
        if (!currentClassId) {
            console.log('No class selected.');
            return;
        }
    
        if (confirm('Are you sure you want to clear all assets for this class?')) {
            fetch('clear_all_assets.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `classId=${currentClassId}`
            })
            .then(response => response.text())
            .then(data => {
                console.log(data); // Log the success or error message from the server
                fetchAndDisplayAssets(currentClassId); // Refresh the assets list to reflect the clear action
            });
        }
    });
    
    
});

assetDivision.style.border = "1px solid black";