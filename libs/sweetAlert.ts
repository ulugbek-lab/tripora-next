import Swal from 'sweetalert2';

export const sweetErrorAlert = async (msg: string, duration: number = 3000) => {
	await Swal.fire({
		icon: 'error',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};
