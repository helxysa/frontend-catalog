export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-50 border-t border-gray-200">
            <div className="mx-auto max-w-7xl flex items-center justify-between py-6 px-4 sm:px-6 lg:px-8">
                <p className="text-sm text-gray-500">
                    &copy; {currentYear} Ministério Público do Amapá. Todos os direitos reservados.
                </p>
                <p className="text-sm text-gray-500">
                    Powered by{' '}
                    <a href="#" className="font-medium text-blue-700 hover:underline">
                        DTI/DSIS - MPAP
                    </a>
                </p>
            </div>
        </footer>
    );
}