(async function() {
    try {
        // Wait for authentication
        await Formant.Authentication.waitTilAuthenticated(); // Access through Formant object

        // Get the authenticated user's ID
        const userId = Formant.Authentication.getUserId(); // Access through Formant object

        // Display the user ID in the web page
        document.getElementById('userIdDisplay').innerText = `User ID: ${userId}`;
    } catch (error) {
        console.error("Authentication failed", error);
        document.getElementById('userIdDisplay').innerText = "Authentication failed";
    }
})();