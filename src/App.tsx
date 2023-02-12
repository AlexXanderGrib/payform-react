import { CardForm } from "./components/CardForm";
import { Wrapper } from "./components/Wrapper";

function App() {
  return (
    <div className="App">
      <Wrapper
        amount={1337.65}
        billId="#150"
        description="Жвачка и чипсы"
        remaining={60_000}
      >
        <CardForm />
      </Wrapper>
    </div>
  );
}

export default App;
