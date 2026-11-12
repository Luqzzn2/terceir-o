/* abertura: letras animadas (WebP animado, já sem o fundo verde) tocam uma vez e o site entra suave */
(() => {
  const R = document.documentElement, box = document.getElementById("ab2"), img = document.getElementById("ab2-i");
  let fim = false;
  const acabar = () => {
    if (fim) return; fim = true;
    box.classList.add("sai");
    setTimeout(() => { R.classList.remove("ab"); box.remove(); dispatchEvent(new Event("abertura-fim")); }, 700);
  };
  box.addEventListener("pointerdown", acabar);
  setTimeout(acabar, 8000); // segurança: se a imagem não carregar, entra no site mesmo assim
  img.onerror = acabar;
  img.onload = () => setTimeout(acabar, 3150 + 500); // 75 quadros de 42 ms, mais uma pausa no final
  img.src = "assets/img/abertura.webp";
})();
