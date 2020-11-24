const routerOutled = document.getElementById('router-outled');

app('/', function(ctx) {
    routerOutled.innerHTML = `
        <product-app></product-app>
    `;
});

app('/produtos', function(ctx) {
    routerOutled.innerHTML = `
        <product-app></product-app>
    `;
});

app('/ofertas', function(ctx) {
    routerOutled.innerHTML = `
        <offer-app></offer-app>
    `;
});

app('*', function(ctx) {
    routerOutled.textContent = 'PAGE NOT FOUND';
});

app.run();
app.run({ base: '/BaseApp' });

// Event Listener para os Links
var links = document.querySelectorAll('a');
var len = links.length;
while( len-- ) {
    links[len].addEventListener('click', function(event) {
        var element = event.target;
        var path = element.pathname + element.search + (element.hash || '');
        app.go(path);
        event.preventDefault();
    });
}