// gameHandlers.js

const { assignRoles } = require('../utils/helpers');

// Assuming db and io are required or passed in some way to be accessible
const joinGameHandler = (socket, db, io) => {
	return (user) => {
		// agrego points donde se almacenarán los puntos de cada jugador
		db.players.push({ id: socket.id, points: 0, ...user });
		console.log(db.players);
		io.emit('userJoined', db); // Broadcasts the message to all connected clients including the sender
	};
};

const startGameHandler = (socket, db, io) => {
	return () => {
		db.players = assignRoles(db.players);

		db.players.forEach((element) => {
			io.to(element.id).emit('startGame', element.role);
		});
	};
};

const notifyMarcoHandler = (socket, db, io) => {
	return () => {
		const rolesToNotify = db.players.filter((user) => user.role === 'polo' || user.role === 'polo-especial');

		rolesToNotify.forEach((element) => {
			io.to(element.id).emit('notification', {
				message: 'Marco!!!',
				userId: socket.id,
			});
		});
	};
};

const notifyPoloHandler = (socket, db, io) => {
	return () => {
		const rolesToNotify = db.players.filter((user) => user.role === 'marco');

		rolesToNotify.forEach((element) => {
			io.to(element.id).emit('notification', {
				message: 'Polo!!',
				userId: socket.id,
			});
		});
	};
};

const onSelectPoloHandler = (socket, db, io) => {
	return (userID) => {
		const myUser = db.players.find((user) => user.id === socket.id);
		const poloSelected = db.players.find((user) => user.id === userID);

		// Logica según selección de marco
		if (poloSelected.role === 'polo-especial') {
			// Si Marco atrapa el polo especial
			if (myUser.role === 'marco') {
				myUser.points += 50; // Sumar 50 puntos a Marco
				poloSelected.points -= 10; // Restar 10 puntos a Polo Especial

				// Verificar si Marco o Polo Especial han ganado
				if (myUser.points >= 100) {
					io.emit('playerWon', { winner: myUser.nickname });
				} else if (poloSelected.points >= 100) {
					io.emit('playerWon', { winner: poloSelected.nickname });
				}
				// Notify all players that the game is over
				db.players.forEach((element) => {
					io.to(element.id).emit('notifyGameOver', {
						message: `El marco ${myUser.nickname} ha ganado, ${poloSelected.nickname} ha sido capturado`,
					});
				});
			} else {
				// Notificar que Marco perdió
				db.players.forEach((element) => {
					io.to(element.id).emit('notifyGameOver', {
						message: `El marco ${myUser.nickname} ha perdido`,
					});
				});
			}
		} else {
			// Si Marco atrapa un polo normal
			if (myUser.role === 'marco') {
				myUser.points -= 10; // Restar 10 puntos a Marco
				poloSelected.points += 10; // Sumar 10 puntos a Polo Especial

				// Notificar que Marco perdió
				db.players.forEach((element) => {
					io.to(element.id).emit('notifyGameOver', {
						message: `El marco ${myUser.nickname} ha perdido por atrapar un polo normal`,
					});
				});
			} else {
				// Notificar que Polo ganó
				db.players.forEach((element) => {
					io.to(element.id).emit('notifyGameOver', {
						message: `Marco no logró atrapar al polo ${poloSelected.nickname}, ¡Polo ha ganado!`,
					});
				});
			}
		}

		// Verificar puntos después de las interacciones
		if (myUser.points >= 100) {
			io.emit('playerWon', { winner: myUser.nickname });

			// Evento para enviar puntos a screen2
			io.emit('receiveAllPlayers', db.players);
		} else if (poloSelected.points >= 100) {
			io.emit('playerWon', { winner: poloSelected.nickname });
			io.emit('receiveAllPlayers', db.players);
		}
		io.emit('updatePoints', db.players);
	};
};

module.exports = {
	joinGameHandler,
	startGameHandler,
	notifyMarcoHandler,
	notifyPoloHandler,
	onSelectPoloHandler,
};
