import { router, socket } from '../routes.js';

export default function renderScreen1() {
	const app = document.getElementById('app');
	app.innerHTML = `
        <h1>Scores</h1>
        <b id="users-count"> <b>0</b></b> usuarios en la sala
        <div id="pool-players"></div>
        <div id="scores-list"></div>
    `;

	let currentPlayers = [];

	const usersCount = document.getElementById('users-count');
	const container = document.getElementById('pool-players');

	socket.on('userJoined', (data) => {
		usersCount.innerHTML = data?.players.length || 0;
		console.log(data);
	});

	// evento que emite el tipo de polo que se eligió
	container.addEventListener('click', function (event) {
		if (event.target.tagName === 'BUTTON') {
			const key = event.target.dataset.key;
			socket.emit('onSelectPolo', key);
		}
	});

	// evento que con el que se escuchan y actualizan los puntos
	socket.on('updatePoints', (players) => {
		const scoresContainer = document.getElementById('scores-list');
		scoresContainer.innerHTML = '';

		players.forEach((player) => {
			currentPlayers = players; // Actualizamos los jugadores actuales
			const scoresContainer = document.getElementById('scores-list');
			scoresContainer.innerHTML = '';

			players.forEach((player) => {
				const scoreItem = document.createElement('p');
				scoreItem.textContent = `${player.nickname} - Puntos: ${player.points}`;
				scoresContainer.appendChild(scoreItem);
			});
		});
	});

	socket.on('playerWon', (data) => {
		router.navigateTo('/screen2');
	});
}
