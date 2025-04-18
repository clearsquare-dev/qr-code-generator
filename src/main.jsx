// Available globals
var domo = window.domo;
var datasets = ["variablesDataset"];
// DOM elements
const filterSelect = document.getElementById("filterSelect");
const updateButton = document.getElementById("updateBtn");
const statusMessage = document.getElementById("statusMessage");
// Add event listeners
updateButton.addEventListener("click", updateVariables);
// Define fields to retrieve from dataset
var filterOptionFields = ["filter_label", "variable_ids", "variable_values"];
// Function to load filter options from Domo dataset
async function loadFilterOptions() {
  try {
    // Show loading state
    showStatus("Loading filters...", "info");
    // Construct query to get filter options
    var filterOptionsQuery = `/data/v1/${datasets[0]}?fields=${filterOptionFields.join()}`;

    // Fetch data from Domo
    const data = await domo.get(filterOptionsQuery);

    if (!data || data.length === 0) {
      showStatus("No filter options found in dataset", "error");
      return;
    }

    // Clear the dropdown
    filterSelect.innerHTML = "";

    // Populate the dropdown with options from the data
    data.forEach((row) => {
      const option = document.createElement("option");
      option.value = JSON.stringify({
        ids: row.variable_ids,
        values: row.variable_values,
      });
      option.textContent = row.filter_label;
      filterSelect.appendChild(option);
    });

    // Select first option by default
    if (filterSelect.options.length > 0) {
      filterSelect.selectedIndex = 0;
    }

    showStatus("Filters loaded successfully", "success");
  } catch (error) {
    console.error("Error loading filter options:", error);
    showStatus("Failed to load filters from dataset", "error");
  }
}
// Function to update multiple variables
function updateVariables() {
  // Check if we have options loaded
  if (filterSelect.options.length === 0 || !filterSelect.value) {
    showStatus("Please select a filter first", "error");
    return;
  }
  try {
    // Get the selected filter option
    const selectedOption = JSON.parse(filterSelect.value);

    // Parse variable IDs and values
    const variableIds = selectedOption.ids.split(",").map((id) => parseInt(id.trim()));
    const variableValues = selectedOption.values.split(",").map((val) => parseInt(val.trim()));

    // Check if arrays have same length
    if (variableIds.length !== variableValues.length) {
      showStatus("Error: Mismatch between variable IDs and values", "error");
      return;
    }

    // Create array of variable objects
    const variables = variableIds.map((id, index) => {
      return {
        functionId: id,
        value: variableValues[index],
      };
    });

    // Send to Domo
    messageVariableContainer(variables);

    // Show success message
    const selectedFilterLabel = filterSelect.options[filterSelect.selectedIndex].text;
    showStatus(`${selectedFilterLabel} updated successfully!`, "success");
  } catch (error) {
    console.error("Error updating variables:", error);
    showStatus("Failed to update variables", "error");
  }
}
// Display status message
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = ""; // Clear previous classes
  if (type === "error") {
    statusMessage.classList.add("text-red-600");
  } else if (type === "success") {
    statusMessage.classList.add("text-green-600");
  } else if (type === "info") {
    statusMessage.classList.add("text-blue-600");
  }

  // Auto-hide after 3 seconds for success messages
  if (type === "success") {
    setTimeout(() => {
      statusMessage.textContent = "";
    }, 3000);
  }
}
// Helper Function for browser compatibility
function messageVariableContainer(variables) {
  const userAgent = window.navigator.userAgent.toLowerCase(),
    safari = /safari/.test(userAgent),
    ios = /iphone|ipod|ipad/.test(userAgent);
  const message = JSON.stringify({
    event: "variable",
    variables: variables,
  });

  if (ios && !safari) {
    window.webkit.messageHandlers.domofilter.postMessage(variables);
  } else {
    window.parent.postMessage(message, "*");
  }
}
// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  // Load filter options when the page loads
  loadFilterOptions();
});
