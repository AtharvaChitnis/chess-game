import { Component } from '@angular/core';
import { Color, FENChar, Coords, CheckState , SafeSquares, pieceImagePaths} from '../../models';
import { ChessBoard } from '../../chess-board';
import { SelectedSquare } from './models';

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.css',
})
export class ChessBoardComponent {
  public pieceImagePaths = pieceImagePaths;

  private chessBoard = new ChessBoard();
  public chessBoardView: (FENChar | null)[][] = this.chessBoard.chessBoardView;
  public get playerColor(): Color {
    return this.chessBoard.playerColor;
  }
  public get safeSquares(): SafeSquares { return this.chessBoard.safeSquares;};
  public get gameOverMessage(): string | undefined {
    return this.chessBoard.gameOverMessage;
  }
  public selectedSquare: SelectedSquare = { piece: null };
  public pieceSafeSquares: Coords[] = [];
  private checkState: CheckState = this.chessBoard.checkState;


  // promotion properties
  public isPromotionActive: boolean = false;
  private promotionCoords: Coords | null = null;
  private promotedPiece: FENChar | null =null;
  public promotionPieces(): FENChar[] {
    return this.playerColor === Color.White ? [FENChar.WhiteKnight, FENChar.WhiteBishop, FENChar.WhiteRook, FENChar.WhiteQueen] : [FENChar.BlackKnight, FENChar.BlackBishop, FENChar.BlackRook, FENChar.BlackQueen];
  }

  public isSquareDark(x: number, y: number): boolean {
    return ChessBoard.isSquareDark(x, y);
  }

  public isSquareSelected(x: number, y: number): boolean {
    if (!this.selectedSquare.piece) return false;
    return this.selectedSquare.x === x && this.selectedSquare.y === y;
  }

  public isSquareSafeForSelectedPiece(x: number, y: number): boolean {
    return this.pieceSafeSquares.some(
      (coords) => coords.x === x && coords.y === y
    );
  }

  private unmarkingPreviouslySelectedAndSafeSquares() : void {
    this.selectedSquare = {piece: null};
    this.pieceSafeSquares = [];

    if(this.isPromotionActive) {
      this.isPromotionActive = false;
      this.promotedPiece = null;
      this.promotionCoords = null;
    }
  }

  private selectingPiece(x: number, y: number): void {
    if (this.gameOverMessage !== undefined) return;
    const piece: FENChar | null = this.chessBoardView[x][y];
    if (!piece) return;
    if (this.isWrongPieceSelected(piece)) return;

    const isSameSquareClicked: boolean =
      !!this.selectedSquare.piece &&
      this.selectedSquare.x === x &&
      this.selectedSquare.y === y;
    this.unmarkingPreviouslySelectedAndSafeSquares();
    if (isSameSquareClicked) return;

    this.selectedSquare = { piece, x, y };
    this.pieceSafeSquares = this.safeSquares.get(x + ',' + y) || [];
  }

  private placingPiece(newX:number, newY: number): void {
    if(!this.selectedSquare.piece) return;
    if(!this.isSquareSafeForSelectedPiece(newX,newY))return;

    // pawn promotion
    const isPawnSelected: boolean = this.selectedSquare.piece === FENChar.WhitePawn || this.selectedSquare.piece === FENChar.BlackPawn;
    const isPawnOnlastRank:boolean = isPawnSelected && (newX===7 || newX ===0);
    const shouldOpenPromotionDialog:boolean = this.isPromotionActive && isPawnOnlastRank;

    if(shouldOpenPromotionDialog) {
      this.pieceSafeSquares = [];
      this.isPromotionActive = true;
      this.promotionCoords = { x: newX, y:newY };
      // because now we wait for players to choose promoted piece
      return;
    }

    const { x: prevX, y:prevY } = this.selectedSquare;
    this.updateBoard(prevX,prevY,newX, newY,this.promotedPiece);
  }

  protected updateBoard(prevX)



  public closePawnPromotionDialog(): void {
    this.unmarkingPreviouslySelectedAndSafeSquares();
  }

  private isWrongPieceSelected(piece: FENChar): boolean {
    const isWhitePieceSelected: boolean = piece === piece.toUpperCase();
    return (
      (isWhitePieceSelected && this.playerColor === Color.Black) ||
      (!isWhitePieceSelected && this.playerColor === Color.White)
    );
  }
}
