function fetchAPI(apiUrl) {
        return fetch(apiUrl).then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok, please try again');
          }
          return response.json();
        }).catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
      };
	  
fetchAPI("https://web-api.qurankemenag.net/quran-surah");