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
	console.log('Container element:', container); // Verificar el contenedor
	const orderAlphabetically = document.getElementById('order-alphabetically');

	let currentPlayers = []; // Variable para almacenar los jugadores actuales
	let isSortedByName = false; // Bandera para alternar entre puntos y nombres

	socket.on('userJoined', (data) => {
		usersCount.innerHTML = data?.players.length || 0;
		console.log(data);
	});

	// Escuchar los puntos de todos los jugadores cuando llegamos a esta pantalla
	socket.on('receiveAllPlayers', (players) => {
		currentPlayers = players; // Almacena los jugadores recibidos
		console.log('Current players before sorting:', currentPlayers);
		displayScores(players); // Llama a la función para mostrar los puntajes
	});

	// Función para mostrar los puntos
	const displayScores = (players) => {
		// Ordenar por puntos de mayor a menor
		const sortedPlayers = players.sort((a, b) => b.points - a.points);

		container.innerHTML = '';
		sortedPlayers.forEach((player) => {
			const scoreItem = document.createElement('p');
			scoreItem.textContent = `${player.nickname} - Puntos: ${player.points}`;
			container.appendChild(scoreItem);
		});
		console.log('Scores displayed:', sortedPlayers); // jugadores
	};

	// Alternar entre el orden por puntos o nombres
	orderAlphabetically.addEventListener('click', () => {
		console.log('Button clicked');

		// Alterna el texto del botón para indicar el orden actual
		const isAlphabeticalOrder = orderAlphabetically.textContent === 'Order by points';

		let sortedPlayers;

		if (isAlphabeticalOrder) {
			// Ordenar por puntos de mayor a menor
			console.log('players when sorting', sortedPlayers);

			sortedPlayers = [...currentPlayers].sort((a, b) => b.points - a.points);
			orderAlphabetically.textContent = 'Order alphabetically'; // Cambia el texto del botón
			console.log('Ordered by points:', sortedPlayers);
		} else {
			// Ordenar alfabéticamente por nombre
			sortedPlayers = [...currentPlayers].sort((a, b) => a.nickname.localeCompare(b.nickname));
			orderAlphabetically.textContent = 'Order by points'; // Cambia el texto del botón
			console.log('Ordered alphabetically:', sortedPlayers);
		}

		displayScores(sortedPlayers); // Mostrar los puntajes ordenados
	});
}
