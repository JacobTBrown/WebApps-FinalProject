export async function welcome_page() {
    const response = await fetch('/viewpage/templates/welcome_page.html', {cache: 'no-store'});
    let html = await response.text();
    
    return html;
}