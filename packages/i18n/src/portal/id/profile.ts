export const profile = {
  title: 'Informasi akun anda',
  subtitle:
    'Perbarui detil profil anda, karena beberapa di antaranya akan dicerminkan di masukan yang anda berikan kepada pasien anda',
  cta: 'Perbarui informasi profil',
  form: {
    personalDetails: {
      title: 'Detail pribadi anda',
      uploadImage: 'Unggah gambar',
      firstName: {
        label: 'Nama depan',
        labelSuffix: ' (wajib)',
      },
      middleName: {
        label: 'Nama tengah',
      },
      lastName: {
        label: 'Nama belakang',
      },
    },
    contactDetails: {
      email: {
        label: 'Alamat email',
        labelSuffix: ' (wajib)',
      },
      mobileNumber: {
        label: 'Nomor seluler',
        labelSuffix: ' (wajib)',
      },
      businessAddress: {
        label: 'Alamat bisnis',
      },
    },
    shortBio: {
      title: 'Bio singkat - tentang diri anda',
      placeholder: 'Tulis sesuatu tentang diri anda',
    },
    review: {
      title: 'Konfirmasi perubahan pada detil pribadi anda',
    },
  },
}
