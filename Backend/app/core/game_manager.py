import chess
import uuid


class GameManager:
    def __init__(self):
        self.games = {}

    def create_game(self):
        game_id = str(uuid.uuid4())
        self.games[game_id] = chess.Board()
        return game_id

    def get_board(self, game_id):
        return self.games.get(game_id)

    def make_move(self, game_id, move):
        board = self.games.get(game_id)
        if not board:
            return None

        chess_move = chess.Move.from_uci(move)

        if chess_move not in board.legal_moves:
            return None

        board.push(chess_move)

        return {
            "fen": board.fen(),
            "is_check": board.is_check(),
            "is_checkmate": board.is_checkmate(),
            "turn": "white" if board.turn else "black",
        }
