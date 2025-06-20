const CODES = ['PAR', 'TYO', 'NYC', 'ROM', 'BER', 'MAD', 'LON', 'YUL', 'CAS', 'AMS', 'FRA', 'LIS', 'IST'];

export default function CodesDataList() {
    return (
        <datalist id="codes">
            {CODES.map(code => <option key={code} value={code} />)}
        </datalist>
    );
}
