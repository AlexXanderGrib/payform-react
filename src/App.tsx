import { CardForm } from "./components/CardForm";
import { Wrapper } from "./components/Wrapper";

function App() {
  return (
    <div>
      <div className="w-full min-h-screen flex items-center flex-col absolute top-0 left-0 bg-secondary-100 dark:bg-black">
        <Wrapper
          amount={1337.65}
          billId="#150"
          description="Жвачка и чипсы"
          remaining={60_000}
        >
          <CardForm onSubmit={console.log} />
        </Wrapper>
      </div>
    </div>
  );
}

export default App;
