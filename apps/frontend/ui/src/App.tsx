import { ThemeProvider } from "@lib-theme";
import { Button } from "@lib-components";

export default function App() {
  return (
    <ThemeProvider>
      <Button appearance="primary"> Hello UI </Button>
    </ThemeProvider>
  );
}
