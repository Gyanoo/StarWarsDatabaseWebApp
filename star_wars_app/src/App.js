import './App.css';
import AlLCharactersComponent from "./components/AllCharactersComponent";

function App() {
  return (
    <div>
      <div className="container">
        <div className="col-sm-8 offset-2 mt-3">
          <h1>Star Wars Characters Database</h1>
          <AlLCharactersComponent />
        </div>
      </div>
    </div>
  );
}

export default App;
