# Page snapshot

```yaml
- generic [ref=e4]:
  - img [ref=e6]
  - heading "Sistema de Gestão" [level=1] [ref=e8]
  - paragraph [ref=e9]: Escolha como deseja acessar o sistema
  - generic [ref=e10]:
    - button "Google" [ref=e11] [cursor=pointer]:
      - img [ref=e12]
      - text: Google
    - button "Login" [ref=e14] [cursor=pointer]:
      - img [ref=e15]
      - text: Login
    - button "Cadastrar" [ref=e17] [cursor=pointer]:
      - img [ref=e18]
      - text: Cadastrar
  - generic [ref=e20]:
    - generic [ref=e21]:
      - img [ref=e22]
      - text: Nickname
    - textbox "Digite seu nickname" [ref=e24]: alexandre
    - generic [ref=e25]: Erro ao fazer login
  - generic [ref=e26]:
    - checkbox "Lembrar Login" [ref=e27] [cursor=pointer]
    - generic [ref=e28] [cursor=pointer]: Lembrar Login
  - button "Entrar com Nickname" [ref=e29] [cursor=pointer]:
    - img [ref=e30]
    - text: Entrar com Nickname
  - generic [ref=e32]:
    - paragraph [ref=e33]:
      - strong [ref=e34]: "👤 Login persistente:"
      - text: Use seu nickname para acessar o sistema.
    - paragraph [ref=e35]: Se ainda não tem uma conta, vá para a aba "Cadastrar".
  - paragraph [ref=e37]: "Backend: http://localhost:4001 • Frontend: http://localhost:3000"
```