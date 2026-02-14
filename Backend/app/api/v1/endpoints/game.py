from fastapi import APIRouter, HTTPException, status
from app.core.game_manager import GameManager

router = APIRouter()

manager = GameManager()


@router.post("/create")
async def create_game():
    game_id = manager.create_game()
    return {"game_id": game_id}


@router.get("/{game_id}")
async def get_board(game_id: str):
    board = manager.get_board(game_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Game Not Found"
        )
    return {"fen": board.fen()}


@router.post("/{game_id}/move/{move}")
async def make_move(game_id: str, move: str):
    board = manager.make_move(game_id, move)

    if not board:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Move (or) Game Not Found",
        )
    return board
