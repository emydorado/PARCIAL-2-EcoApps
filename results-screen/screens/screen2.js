import { router, socket } from '../routes.js';

export default function renderScreen2() {
	const app = document.getElementById('app');
	app.innerHTML = `
        <h1>Final Ranking</h1>
        <b id="users-count"> <b>0</b></b> usuarios en la sala
        <div id="pool-players"></div>
        <button id="order-alphabetically">Order alphabetically</button>
    `;

	const usersCount = document.getElementById('users-count');
	const container = document.getElementById('pool-players');
	const orderAlphabetically = document.getElementById('order-alphabetically');

	let currentPlayers = []; // variable para almacenar los jugadores actuales
	let isSortedByName = false; // bandera para alternar entre puntos y nombres

	// traer usuarios
	socket.on('userJoined', (data) => {
		usersCount.innerHTML = data?.players.length || 0;
		console.log(data);
	});

	// escuchar los puntos de todos los jugadores cuando se cambia a esta pantalla
	socket.on('receiveAllPlayers', (players) => {
		currentPlayers = players; // Almacena los jugadores recibidos
		displayScores(players); // Llama a la función para mostrar los puntajes
		displayScores(players, isSortedByName); // Llama a la función para mostrar los puntajes
	});

	// función para mostrar los puntos con posición de ranking
	const displayScores = (players) => {
		// Ordenar por puntos de mayor a menor
		const sortedPlayers = players.sort((a, b) => b.points - a.points);

		container.innerHTML = '';
		sortedPlayers.forEach((player, index) => {
			// Agrega un número de ranking al lado del nombre del jugador
			const rank = index + 1;
			const scoreItem = document.createElement('p');
			scoreItem.textContent = `${rank}. ${player.nickname}: ${player.points}`;
			container.appendChild(scoreItem);
		});
		console.log('Scores displayed:', sortedPlayers); // jugadores
	};

	// alternar entre el orden por puntos o nombres
	orderAlphabetically.addEventListener('click', () => {
		console.log('Button clicked');

		let sortedPlayers;

		// Verificar si actualmente está ordenado alfabéticamente
		if (isSortedByName) {
			// Ordenar por puntos de mayor a menor
			sortedPlayers = [...currentPlayers].sort((a, b) => b.points - a.points);
			orderAlphabetically.textContent = 'Order alphabetically'; // Cambia el texto del botón
		} else {
			// Ordenar alfabéticamente por nombre

			rankingItems.sort((a, b) => {
				const namea = a.textContent.split('.')[1].trim();
				const nameb = b.textContent.split('.')[1].trim();
				return namea.localeCompare(nameb);
			});

			sortedPlayers = [...currentPlayers].sort((a, b) => a.nickname.localeCompare(b.nickname));
			orderAlphabetically.textContent = 'Order by points'; // Cambia el texto del botón
		}

		isSortedByName = !isSortedByName; // Alternar el estado
		displayScores(sortedPlayers); // Mostrar los puntajes ordenados
	});
}
